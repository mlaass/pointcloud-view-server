# 3D Pointcloud Viewer

Renders pointclouds saved in h5 format using three.js.

h5 format:
```
<FILENAME>.h5 h5file {
    <POINTCLOUD_NAME> Group {
        coords: Dataset {<SIZE>, 3}
        rgb: Dataset {<SIZE>, 3} (optional)
    }
}
```
## installing
```
pip install -r requirements.txt
```

## configure
 In `server.py` change datapath to point to the directoris with your h5 files:
 ```
config = {
    "datapath": "/data/pointclouds/data/"
}
 ```

## running
to run just start flask and go to the provided url in your browser.

```
./run.sh
```
