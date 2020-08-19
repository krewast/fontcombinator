(function($) {
  $(document).ready(function() {
    var fontcombinator = new Vue({
      el: '#fontcombinator',
      data: {
        tags: [
          {
            name: 'h1',
            font: undefined,
            variant: undefined,
            fontSize: 36,
            lineHeight: 1.15,
            marginBottom: 0.4,
            subsets: [],
          },
          {
            name: 'h2',
            font: undefined,
            variant: undefined,
            fontSize: 32,
            lineHeight: 1.15,
            marginBottom: 0.4,
            subsets: [],
          },
          {
            name: 'h3',
            font: undefined,
            variant: undefined,
            fontSize: 24,
            lineHeight: 1.15,
            marginBottom: 0.4,
            subsets: [],
          },
          {
            name: 'p',
            font: undefined,
            variant: undefined,
            fontSize: 18,
            lineHeight: 1.3,
            marginBottom: 0.8,
            subsets: [],
          },
          {
            name: 'code',
            font: undefined,
            variant: undefined,
            fontSize: 18,
            lineHeight: 1.3,
            marginBottom: 0.8,
            subsets: [],
          },
          {
            name: 'blockquote',
            font: undefined,
            variant: undefined,
            fontSize: 18,
            lineHeight: 1.3,
            marginBottom: 0.8,
            subsets: [],
          },
        ],
        fonts: [],
        input: '',
        embedCodeHTML: '',
        embedCodeCSS: ''
      },
      beforeCreate: function() {
        $.get('./data/fonts_metadata.json', function(data) {
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

            // Set a variant
            if (tag.variant === undefined) {
              tag.variant = tag.font.defaultVariant;
            } else {
              var selectedVariantIsAvailable = false;
              for (variant of tag.font.variants) {
                if (variant.weight === tag.variant.weight &&
                    variant.style === tag.variant.style) {
                  selectedVariantIsAvailable = true;
                  break;
                }
              }
              if (selectedVariantIsAvailable === false) {
                tag.variant = tag.font.defaultVariant;
              }
            }

            // Set the right subsets (Use as many of the already selected as possible)
            // TODO: This results in calling the updateContent function multiple times
            //       if the already selected subsets are very different from those
            //       the newly selected font family offers
            //       Example: "latin" selected, but the new font family only offers "korean"
            for (var i = 0; i < tag.subsets.length; i++) {
              if (!tag.font.subsets.includes(tag.subsets[i])) {
                tag.subsets.splice(i, 1);
              }
            }
            if (tag.subsets.length === 0) {
              tag.subsets.push(tag.font.defaultSubset);
            }

            // HTML
            var htmlFontFamilyName = tag.font.name.replace(' ', '+');
            var htmlFontWeight = tag.variant.weight;
            var htmlFontStyle = tag.variant.style === 'italic' ? 'i' : '' // Adding an 'i' behind the font weight loads the italic version (German: "Schriftschnitt")
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
            var cssFontStyle    = tag.variant.style;
            var cssFontWeight   = tag.variant.weight;
            var cssLineHeight   = tag.lineHeight + 'em';
            var cssMarginBottom = tag.marginBottom + 'em';

            $('#design-tab #editor-output ' + cssTagName + (cssTagName === 'blockquote' ? ' p' : ''))
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
