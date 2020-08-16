#! /usr/bin/env python3

from google.protobuf import text_format

import fonts_public_pb2
import glob
import json

print('- Start generating fonts_metadata.json')

# Get a list of all font families that have already been published on Google Fonts
published_fonts_json = None
with open('published_fonts_metadata.json') as file:
    published_fonts_json = json.load(file)

font_families = []

# Each license has a separate directory that contains fonts
for dir_name in ['apache', 'ofl', 'ufl']:
    # Find all font METADATA.pb files
    for protobuf_file_path in glob.iglob(f"fonts/{dir_name}/**/METADATA.pb", recursive=True):
        # Open and parse the current METADATA.pb file
        protobuf_file = open(protobuf_file_path, 'rb')
        protobuf = protobuf_file.read().decode('latin1') # utf-8 doesn't work in some cases :(
        protobuf_font_family = fonts_public_pb2.FamilyProto()
        text_format.Merge(protobuf, protobuf_font_family)

        # Check if the current font family has already been published
        current_published_font_family = None
        for published_font_family in published_fonts_json:
            if published_font_family['family'] == protobuf_font_family.name:
                current_published_font_family = published_font_family
                break

        # Don't include any font family that hasn't been published on Google Fonts, yet
        if current_published_font_family is None:
            continue

        # Dict to hold all the necessary data for each font family
        font_family = {
            'name': protobuf_font_family.name,
            'designer': protobuf_font_family.designer,
            'license': protobuf_font_family.license,
            'category': protobuf_font_family.category,
            'variants': [],
            'subsets': [],
            'version': published_font_family['version'],
            'lastModified': published_font_family['lastModified'],
            'popularity': published_font_family['popularity']
        }

        for font in protobuf_font_family.fonts:
            variant = {
                'style': font.style,
                'weight': font.weight
            }
            font_family['variants'].append(variant)

        for subset in protobuf_font_family.subsets:
            if (subset not in font_family['subsets']) and (subset != 'menu'):
                font_family['subsets'].append(subset)

        # Don't include fonts without language subsets (e.g. Adobe Blank)
        if (font_family['subsets']):
            font_families.append(font_family)

with open('./public/data/fonts_metadata.json', 'w') as file:
    json.dump(font_families, file)

print('- Finished successfully')
