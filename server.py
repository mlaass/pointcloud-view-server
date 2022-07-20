from pathlib import Path
import traceback
import random
import json
from json import JSONEncoder
import io
import sys
import os
import glob
import h5py
import struct
import numpy as np
from flask import Flask, request, send_from_directory, render_template, send_file, make_response
from functools import lru_cache

config = {
    "datapath": "/data/ssd/moritz/tf/pointclouds/data/"
}

app = Flask(__name__, static_url_path='')


class NumpyArrayEncoder(JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return JSONEncoder.default(self, obj)


@lru_cache(maxsize=32)
def get_file_info(file):
    with h5py.File(f'{config["datapath"]}{file}', "r") as f:
        sizes = {}
        for grp in list(f.keys()):
            sizes[grp] = len(f[grp]["coords"])
        return sizes


@lru_cache(maxsize=16)
def get_file_group(file, group):
    with h5py.File(f'{config["datapath"]}{file}', "r") as f:
        res = {}
        coords = f[group]["coords"][:]
        res['coords'] = coords
        res['stats'] = {
            'count': len(coords),
            'bounds': [np.min(coords, axis=0),
                       np.max(coords, axis=0)],
            'center': np.mean(coords, axis=0),
        }
        if "rgb" in f[group]:
            rgb = f[group]["rgb"][:].astype(np.float32)
            rgb /= 255
            res['rgb'] = rgb

        return res


@app.route('/')
def root_route():
    return render_template('index.html')


@app.route('/datasets/')
def send_ds_route():
    files = glob.glob(f'{config["datapath"]}**.h5', recursive=False)
    files = [os.path.basename(f) for f in files]
    files = [f for f in files if not f.endswith('_features.h5')]

    info = {}
    for file in files:
        info[file] = get_file_info(file)

    return {"files": info}


@app.route('/datasets/<string:file>')
def send_dsf_route(file):
    info = {}
    info[file] = get_file_info(file)
    return info


@app.route('/datasets/<string:file>/<string:group>')
def send_dsfg_route(file, group):
    data = get_file_group(file, group)
    response = app.response_class(
        response=json.dumps(data, cls=NumpyArrayEncoder),
        status=200,
        mimetype='application/json'
    )
    return response


@app.route('/static/<path:path>')
def send_static_route(path):
    return send_from_directory('static', path)
