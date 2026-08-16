import runpy
ns=runpy.run_path('/home/ubuntu/baki-metro-marshrut/generate_ayna_routes_radius.py')
print('centers', sorted(ns['station_points']))
print('missing', sorted(set(ns['station_aliases'])-set(ns['station_points'])))
