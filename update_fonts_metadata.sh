#!/bin/bash

# Get a JSON file with all already published font families on Google Fonts
# Use the Google Webfonts Helper instead of the original Google Fonts API because it doesn't require any credentials
curl https://google-webfonts-helper.herokuapp.com/api/fonts > published_fonts_metadata.json

# Clone the Google Font repo or pull its newest state
if [[ ! -d "fonts" ]]
then
  git clone https://github.com/google/fonts.git
else
  cd fonts
  git pull
  cd ..
fi

# Extract font metadata and generate a JSON file
python3 extract_fonts_metadata.py
