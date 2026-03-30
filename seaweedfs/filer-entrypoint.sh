#!/bin/sh
set -e

sed \
  -e "s|\${SEAWEEDFS_ACCESS_KEY}|${SEAWEEDFS_ACCESS_KEY}|g" \
  -e "s|\${SEAWEEDFS_SECRET_KEY}|${SEAWEEDFS_SECRET_KEY}|g" \
  /etc/seaweedfs/s3.json.tpl > /etc/seaweedfs/s3.json

exec weed filer \
  -master=seaweedfs-master:9333 \
  -ip.bind=0.0.0.0 \
  -s3 \
  -s3.port=8333 \
  -s3.config=/etc/seaweedfs/s3.json
