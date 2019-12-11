#! /usr/bin/env python3

from google.protobuf import text_format

import fonts_public_pb2
import glob
import json

print('- Start generating metadata.json')

font_families = {}

# Each license has a separate directory that contains fonts
for dir_name in ['apache', 'ofl', 'ufl']:
    # Find all font METADATA.pb files
    for protobuf_file_path in glob.iglob(f"fonts/{dir_name}/**/METADATA.pb", recursive=True):
        # Open and parse the current METADATA.pb file
        protobuf_file = open(protobuf_file_path, 'rb')
        protobuf = protobuf_file.read().decode('latin1') # utf-8 doesn't work in some cases :(
        protobuf_font_family = fonts_public_pb2.FamilyProto()
        text_format.Merge(protobuf, protobuf_font_family)

        # Dict to hold all the necessary data for the 
        font_family = {
            'designer': protobuf_font_family.designer,
            'license': protobuf_font_family.license,
            'category': protobuf_font_family.category,
            'variants': [],
            'subsets': []
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

        font_families[protobuf_font_family.name] = font_family

with open('metadata.json', 'w') as file:
    json.dump(font_families, file)

print('- Finished successfully')
