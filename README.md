# 辅助脚本

### 参考
forked by ```https://github.com/TivonJJ/html5-music-player```

### 转music.json的js
```
window.document.write('[');
list.forEach(function(item,index){
    item["link_url"] = "audio/" + item["name"]+' - '+ item["singer"] +'.mp3';
    item["link_lrc"] = "audio/" + item["name"]+' - '+ item["singer"] +'.lrc';
    item["format"] = "mp3";
    window.document.write(JSON.stringify(item));
    if (index < list.length-1) {
        window.document.write(',');
    }
}); // end foreach
window.document.writeln(']');
```
# 