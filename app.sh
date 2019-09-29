#生成打包时间
# time=$(date +%s)
time=$(date +%Y%m%d_%H%M%S)
echo 'buildTime:'$time > 'app.ver'
#开始打包
/Applications/CocosCreator.app/Contents/MacOS/CocosCreator --path ./ --build
echo 'buildTime:'$time > 'build/web-mobile/app.ver'
#加密project.js
find build/web-mobile/src/project*.js | xargs -I {} echo {} > temp.txt
cat temp.txt | xargs -I {} javascript-obfuscator {} --output {} --compact true --self-defending false
rm temp.txt
#调用发布脚本
sh ./publish.sh $time