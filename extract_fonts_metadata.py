#! /usr/bin/env python3

from google.protobuf import text_format

import fonts_public_pb2
import glob
import json

print('- Start generating fonts_metadata.json')

# Get a list of all font families that have already been published on Google Fonts
published_font_families_json = None
with open('published_fonts_metadata.json') as file:
    published_font_families_json = json.load(file)

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
        # And yes, this algorithm is not fast. Does it matter? Nope...
        current_published_font_family = None
        for published_font_family in published_font_families_json:
            if published_font_family['family'] == protobuf_font_family.name:
                current_published_font_family = published_font_family
                break

        # Don't include any font family that hasn't been published on Google Fonts, yet
        # --> Some font families are already in the Google Fonts repo but not on the site, yet.
        # --> Don't use them
        if current_published_font_family is None:
            continue

        # Dict to hold all the necessary data for each font family
        font_family = {
            'name': protobuf_font_family.name,
            'variants': [],
            'defaultVariant': None,
            'subsets': [],
            'defaultSubset': 'latin',
            'category': protobuf_font_family.category,
            'designer': protobuf_font_family.designer,
            'license': protobuf_font_family.license,
            'popularity': published_font_family['popularity'],
            'version': published_font_family['version'],
            'lastModified': published_font_family['lastModified']
        }

        # Add all available variants of this font to a list
        for font in protobuf_font_family.fonts:
            variant = {
                'weight': font.weight,
                'style': font.style
            }
            font_family['variants'].append(variant)

            # Check if there is the standard variant (400, normal) available and use it as default
            if variant['weight'] == 400 and variant['style'] == 'normal':
                font_family['defaultVariant'] = variant

        # Some fonts don't have the standard variant (400, normal). Use another one instead
        if font_family['defaultVariant'] == None:
            font_family['defaultVariant'] = font_family['variants'][0]

        # Add all available subsets of this font to a list
        for subset in protobuf_font_family.subsets:
            if (subset not in font_family['subsets']) and (subset != 'menu'):
                font_family['subsets'].append(subset)

        # If the subset "latin" is not in the "subsets" list (very rare) use another one instead
        if font_family['defaultSubset'] not in font_family['subsets']:
            font_family['defaultSubset'] = font_family['subsets'][0]

        # Don't include fonts without language subsets (e.g. Adobe Blank)
        if (font_family['subsets']):
            font_families.append(font_family)

with open('./public/data/fonts_metadata.json', 'w') as file:
    json.dump(font_families, file)

print('- Finished successfully')
