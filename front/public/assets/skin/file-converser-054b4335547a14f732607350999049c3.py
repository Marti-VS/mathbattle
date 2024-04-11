import json

def parse_atlas(atlas_file):
    data = {}
    current_image = None

    with open(atlas_file, 'r') as f:
        for line in f:
            line = line.strip()
            if line.endswith('.png'):
                current_image = line
                data[current_image] = {}
            elif line and current_image:
                key, value = line.split(': ')
                data[current_image][key] = value

    return data

def atlas_to_json(atlas_file, output_json):
    data = parse_atlas(atlas_file)
    with open(output_json, 'w') as f:
        json.dump(data, f, indent=4)

atlas_to_json('orange-ui.atlas', 'orange-ui.json')
