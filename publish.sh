
# if [$1='']; then
if [ $# != 1 ] ; then
    echo 'version = null'$#
    exit 0
fi
echo 'version:'$1
svn update ./svn
rm -rf ./svn/*
cp -r ./build/web-mobile/* ./svn/
# svn add ./svn --no-ignore --force
cd ./svn
# svn status  | awk '{print $2}'|xargs svn add 
svn status | awk '{if ( $1 == "?") { print $2}}' | xargs svn add
svn status | awk '{if ( $1 == "!") { print $2}}' | xargs svn delete
svn commit  --message "'release '$1"
time=$(date +%s)
# echo $time
curl http://game.g22rd.cn:12580/svnup
open http://game.g22rd.cn:8002/animal/index.html?time=$time


cd ../build/web-mobile
zip -r animal_$1.zip ./ -x *.DS_Store
