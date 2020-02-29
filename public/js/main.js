(function($) {
  $(document).ready(function() {
    var fontcombinator = new Vue({
      el: '#fontcombinator',
      data: {
        tags: [
          {
            name: 'h1',
            font: undefined,
            fontVariant: undefined,
            fontSize: 34,
            lineHeight: 1.15,
            marginBottom: 0.2,
            subsets: ['latin'],
          },
          {
            name: 'h2',
            font: undefined,
            fontVariant: undefined,
            fontSize: 30,
            lineHeight: 1.15,
            marginBottom: 0.2,
            subsets: ['latin'],
          },
          {
            name: 'h3',
            font: undefined,
            fontVariant: undefined,
            fontSize: 26,
            lineHeight: 1.15,
            marginBottom: 0.2,
            subsets: ['latin'],
          },
          {
            name: 'p',
            font: undefined,
            fontVariant: undefined,
            fontSize: 18,
            lineHeight: 1.4,
            marginBottom: 0.8,
            subsets: ['latin'],
          },
        ],
        fonts: [],
        input: '',
        embedCodeHTML: '',
        embedCodeCSS: ''
      },
      beforeCreate: function() {
        $.get('./data/metadata.json', function(data) {
          fontcombinator.fonts = data;
        });
        $.get('./data/introduction.txt', function(data) {
          fontcombinator.input = data;
        });
      },
      computed: {
        compiledMarkdown: function() {
          return marked(this.input)
        },
        orderedFonts: function() {
          return _.orderBy(this.fonts, 'name')
        },
      },
      methods: {
        prettyFontCategory: function(category) {
          return (category.charAt(0) + category.slice(1).toLowerCase()).replace('_', ' ');
        },
        updateContent: function() {
          this.embedCodeHTML = '';
          this.embedCodeCSS = '';

          for (tag of this.tags) {
            if (tag.font === undefined) {
              continue;
            }

            if (tag.fontVariant === undefined) {
              var defaultFontVariantFound = false;
              var defaultFontVariantIndex = 0;
              for (var fontVariant of tag.font.variants) {
                if (fontVariant.weight === 400 && fontVariant.style === 'normal') {
                  defaultFontVariantFound = true;
                  break;
                }
                defaultFontVariantIndex++;
              }

              if (defaultFontVariantFound) {
                tag.fontVariant = tag.font.variants[defaultFontVariantIndex];
              } else {
                tag.fontVariant = tag.font.variants[0];
              }
            }

            // HTML
            var htmlFontFamilyName = tag.font.name.replace(' ', '+');
            var htmlFontWeight = tag.fontVariant.weight;
            var htmlFontStyle = tag.fontVariant.style === 'italic' ? 'i' : '' // Adding an 'i' behind the font weight loads the italic version (German: "Schriftschnitt")
            var htmlSubsets = tag.subsets.join(',')
            // Is it a good idea to create URLs and HTML tags manually like that? NO! Am I doing it anyway here? YES!
            // Example:  <link href="https://fonts.googleapis.com/css?family=Open+Sans:400,400i,700,700i&display=swap&subset=cyrillic,greek" rel="stylesheet">
            var embed = '<link href="https://fonts.googleapis.com/css?family=' + htmlFontFamilyName + ':' + htmlFontWeight + htmlFontStyle + '&display=swap&subset=' + htmlSubsets + '" rel="stylesheet">';

            $('head').append(embed);

            this.embedCodeHTML += embed + "\n";

            // CSS
            var cssTagName      = tag.name;
            var cssFontFamily   = "'" + tag.font.name + "', " + tag.font.category.toLowerCase().replace('_', '-');
            var cssFontSize     = tag.fontSize + 'px';
            var cssFontStyle    = tag.fontVariant.style;
            var cssFontWeight   = tag.fontVariant.weight;
            var cssLineHeight   = tag.lineHeight + 'em';
            var cssMarginBottom = tag.marginBottom + 'em';

            $('#design-tab #editor-output ' + cssTagName)
            .css('font-family',   cssFontFamily)
            .css('font-size',     cssFontSize)
            .css('font-style',    cssFontStyle)
            .css('font-weight',   cssFontWeight)
            .css('line-height',   cssLineHeight)
            .css('margin-bottom', cssMarginBottom);

            this.embedCodeCSS += cssTagName + " {\n";
            this.embedCodeCSS += "  font-family: "   + cssFontFamily   + ";\n";
            this.embedCodeCSS += "  font-size: "     + cssFontSize     + ";\n";
            this.embedCodeCSS += "  font-style: "    + cssFontStyle    + ";\n";
            this.embedCodeCSS += "  font-weight: "   + cssFontWeight   + ";\n";
            this.embedCodeCSS += "  line-height: "   + cssLineHeight   + ";\n";
            this.embedCodeCSS += "  margin-bottom: " + cssMarginBottom + ";\n";
            this.embedCodeCSS += "}\n\n";
          }
        },
        updateMarkdown: _.debounce(function (e) {
          this.input = e.target.value
        }, 300)
      },
      watch: {
        tags: {
          // This is basically a brute force approach...
          deep: true,
          handler() {
            this.updateContent();
          }
        },
      }
    });

    // Set the current year in the footer via JS to keep it updated
    var currentYear = (new Date()).getFullYear();
    $('#current-year').text(currentYear);
  });
})(jQuery);
