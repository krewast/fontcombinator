# Font Combinator

Quickly and easily find suitable web fonts or matching combinations of web fonts for your next project.

<https://www.fontcombinator.app/>


## Development

This project is a pure frontend web app without any backend, database or the need to compile/transpile any code. **It's a side project and meant to be kept as simple as possible.**

### Dependencies

All necessary dependencies are included in this repository, no external sources.

- Bootstrap 4.5.2
- jQuery 3.5.1
- Lodash 4.17.20
- Marked 1.1.1
- Vue.js 2.6.11

### Run the application locally

Requires Python 3.5 or higher.

Clone this repository, open a terminal window, point it to the "public" folder of this project and start the built-in Python HTTP server:

```bash
python3 -m http.server 8000
```

The site will be available at: <http://localhost:8000/>

**Note:** Directly opening the index.html file in the "public" directory with your browser of choice won't work!

### Update the list of fonts

**Note:** This step is not necessary to run the application locally. Do it only if you really want to update the list of fonts.

Google regularly adds new fonts to the [Google Fonts repository](https://github.com/google/fonts) on Github. However, those newly added fonts aren't immediately available on the [Google Fonts website](https://fonts.google.com/). To create a list of all available fonts that also contains the required data for the Font Combinator, two sources are necessary.

The first source is a list of fonts that are already available on the Google Fonts website (`published_fonts_metadata.json`). One way to get such a list is to use the official [Google Fonts Developer API](https://developers.google.com/fonts/docs/developer_api), but that requires an API key. Another way is to use the API of the wonderful [google-webfonts-helper](https://github.com/majodev/google-webfonts-helper) project: <https://google-webfonts-helper.herokuapp.com/api/fonts>

The seconds source is data from all the fonts in the Google Fonts repository. To get it, the entire repo has to be cloned and the data extracted. This is what the `extract_fonts_metadata.py` script does. It generates, in combination with the `published_fonts_metadata.json` file, `fonts_metadata.json`.

To keep things simple, all the steps above can be performed automatically by running the `update_fonts_metadata.sh` script. First, make sure that it can be executed on your machine:

```bash
chmod +x update_fonts_metadata.sh
```

Then run it like that:

```bash
./update_fonts_metadata.sh 
```

**Note:** The script downloads the entire Google Fonts repository (about 1 GB in size), so that may take a while.

### Update the protocol buffer files

To extract data from the Google Fonts repository, the `extract_fonts_metadata.py` script uses [protocol buffers](https://en.wikipedia.org/wiki/Protocol_Buffers) (a method of serializing data, developed by Google). To do so, the two files `fonts_public.proto` and `fonts_public_pb2.py` are required. To download/update the first one, use:

```bash
curl https://raw.githubusercontent.com/googlefonts/gftools/master/Lib/gftools/fonts_public.proto > fonts_public.proto
```

Then install the protoc package on your machine (Ubuntu)

```bash
sudo apt install protoc
```

And generate/update `fonts_public_pb2.py` by calling:

```bash
protoc -I=. --python_out=. fonts_public.proto
```


## To Dos

As with nearly every software project, there is always room for improvement. These are the things that should be implemented next, in no particular order:

- [ ] Improve the font selection
    - [ ] Search
    - [ ] Sort by name or popularity
    - [ ] Show a preview of each font
- [ ] Improve the embed function
- [ ] Colorpicker
    - [ ] For each tag (color + background-color)
    - [ ] For the background-color of the "Design" area (Separate element in the sidebar)
- [ ] Nice example font combinations / pairings (in a new tab)

Please keep in mind that this is a hobby project and I only work on it when there is enough time to do so.


## Contributing

I welcome contributions, but please remember the <a href="https://en.wikipedia.org/wiki/KISS_principle" target="_blank">KISS principle</a> :)

The keep things consistent, use the following tags for your commits:

```
[Bugfix]

[Feature new]
[Feature updated]

[Layout new]
[Layout updated]

[File new]
[File updated]

[Cleanup]
```


## Disclaimer

This project is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Google, or any of its subsidiaries or its affiliates.

The name "Google" as well as related names, marks, emblems and images are registered trademarks of Google LLC, Mountain View, California.
