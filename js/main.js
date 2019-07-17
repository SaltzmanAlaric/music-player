_.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
};
var playCtrl = $("#playerCtrl"),
    musicList = $("#music_list"),
    playerProgress = $("#playerProgress"),
    playInfo = $(".playing_info"),
    album_art = $(".album_art"),
    lyric_wrap = $(".lyric_wrap"),
    lyric = lyric_wrap.find("#lyric");
var mode = 0;
var origin_json = [];
var music_json = [];
$(document).ready(onReady);
function onReady(){
    getPlayList();
    initPlayerProgress();
    initPlayCtrl();
    $player.bind("error",function(e){
        alert(e.message);
    });
}

function initPlayerProgress(){
    var total =  playerProgress.find(".totalTime"),
        current = playerProgress.find(".currentTime");
    $player.bind("timeupdate",function(){
        var currentTime = this.currentTime,
            duration = this.duration;
        $progressbar.setProgress(currentTime/duration*100);
        current.html(parseTime(currentTime));
    });
    $player.bind("playing",function(){
        $progressbar.slideable = true;
        musicList.find(".selected").addClass("playing");
        playCtrl.find(".play").addClass("playing");
        total.html(parseTime(this.duration));
        renderInfo($player.music);
        renderLyric($player.music);
    });
    $player.bind("pause ended",function(evt){
        musicList.find(".selected").removeClass("playing");
        playCtrl.find(".play").removeClass("playing");
        album_art.removeClass("active");
        if(evt.type == "ended"){
            $progressbar.slideable = false;
            $player.unbind("timeupdate",updateLyric);
            text_temp = undefined;
            var $list = $("#music_list").find("li")
            var nextIndex = getAutoNextSongIndex($list.length);
            console.log(nextIndex);
            musicList.find(".selected").removeClass("selected");
            $($list[nextIndex]).addClass('selected');
            $($list[nextIndex]).trigger("click");
        }
    });
    $progressbar.bind("change",function(){
        if(!$player.music)return;
        var p = $progressbar.progress;
        var time = $player.geDuration()*(p/100);
        $player.seekTo(time);
        console.log(time)
    });
    function parseTime(time){
        var min = String(parseInt(time/60)),
            sec = String(parseInt(time%60));
        if(min.length==1)min = "0"+min;
        if(sec.length==1)sec = "0"+sec;
        return min+":"+sec;
    }
}

// 自动播放获取下一首的下标
function getAutoNextSongIndex(len) {
    if (len == 1) {
        return 0;
    }
    var currIndex = 0;
    musicList.find("li").forEach(function(item,index){
        if (!!item.getAttribute("class")) {
            currIndex = index;
        }
    })
    // 列表循环
    if (mode == 0) {
        return currIndex == (len-1) ? 0: currIndex + 1;
    // 随机播放
    } else if (mode == 1) {
        return  Math.floor(Math.random()*len);
    // 单曲循环
    } else {
        return currIndex;
    }
}

function renderInfo(music){
    playInfo.find(".songName").html(music.name);
    playInfo.find(".singer").html(music.singer);
    album_art.addClass("active");
    album_art.find(".cover").attr("src",music.cover || 'res/images/bg-disc3.jpg');
    var infoTemp = _.template($("#music_info").html());
    $(".music_info").html(infoTemp(music));
}

function renderLyric(music){
    lyric.html("");
    var lyricLineHeight = 27,
        offset = lyric_wrap.offset().height*0.4;
    music.lyric.fetch(function(data){
        music.lyric.parsed = {};
        var i = 0;
        for(var k in data){
            var txt = data[k];
            if(!txt)txt = "&nbsp;";
            music.lyric.parsed[k] = {
                index:i++,
                text:txt,
                top: i*lyricLineHeight-offset
            };
            var li = $("<li>"+txt+"</li>");
            lyric.append(li);
        }
        $player.bind("timeupdate",updateLyric);
    },function(){
        lyric.html("<li style='text-align: center'>歌词加载失败</li>");
    });
}

var text_temp;
function updateLyric(){
    var data = $player.music.lyric.parsed;
    if(!data)return;
    var currentTime = Math.round(this.currentTime);
    var lrc = data[currentTime];
    if(!lrc)return;
    var text = lrc.text;
    if(text != text_temp){
        locationLrc(lrc);
        text_temp = text;
    }
    function locationLrc(lrc){
        lyric_wrap.find(".lyric_wrap .on").removeClass("on");
        var li = lyric_wrap.find("li:nth-child("+(lrc.index+1)+")");
        li.addClass("on");
        var top = Math.min(0,-lrc.top);
        //lyric.css({"-webkit-transform":"translate(0,-"+lrc.top+"px)"});
        lyric.css({"margin-top":top});
    }
}

function getParams(key){
    var params = window.location.search.split('?')[1];
    if (params) {
        var map = params.match("(^|&)" + key + "=([^&]*)");
        if (map) {
            return decodeURI(map[2]);
        }
    }
    return null;
};

function getPlayList(){
    var list = $("#music_list");
    var songList = getParams("song") || "music";
    $.ajax({
        url: songList + ".json",
        cache: true,
        success:function(data){
            origin_json = data;
            music_json = origin_json;
            fillDom();
        },
        error:function(e){
            list.html('<li style="text-align: center;display: block;">音乐列表获取失败！</li>');
        }
    });
    list.on("click","li",function(){
        musicList.find(".selected").removeClass("selected");
        $(this).addClass("selected");
        $player.play(this.music);
    });
}

function initPlayCtrl(){
    playCtrl.find(".loop").bind("click",function(){
        switch (mode) {
            // 列表循环
            case 0:
                $(this).css("background", "url(res/images/pcrl/playbar.png) no-repeat -66px -248px;");
                //console.log("random");
                break;
            // 随机播放
            case 1:
                $(this).css("background", "url(res/images/pcrl/playbar.png) no-repeat -93px -344px;");
                //console.log("circle");
                break;
            // 单曲循环
            case 2:
                $(this).css("background", "url(res/images/pcrl/playbar.png) no-repeat -3px -344px;");
                //console.log("loop");
                break;
            default:
                mode = 2;
                break;
        }
        mode = (mode == 2) ? 0: mode+1;
    });
    playCtrl.find(".collect").bind("click",function(){
        if ($(this).css("background").includes("res/images/pcrl/collect.png")) {
            $("#scrollWrapper").hide();
            $("#searchWrapper").show();
            $(this).css("backgroundImage", "url(res/images/pcrl/collected.png)");
        } else {
            $(this).css("backgroundImage", "url(res/images/pcrl/collect.png)");
            music_json = origin_json;
            fillDom();
            $("#searchName").val("");
            $("#scrollWrapper").show();
            $("#searchWrapper").hide();
        }
    });
    playCtrl.find(".collected").bind("click",function(){

    });
    playCtrl.find(".play").bind("click",function(){
        if($player.music){
            $player.play($player.music);
        }else{
            musicList.find("li:first-child").trigger("click");
        }
    });
    playCtrl.find(".prev").bind("click",function(){
        var prev = musicList.find(".selected").prev("li");
        prev.trigger("click");
    });
    playCtrl.find(".next").bind("click",function(){
        if (mode == 1) {
            var $list = $("#music_list").find("li")
            var nextIndex = getAutoNextSongIndex($list.length);
            musicList.find(".selected").removeClass("selected");
            $($list[nextIndex]).addClass('selected');
            $($list[nextIndex]).trigger("click");
        } else {
            var next = musicList.find(".selected").next("li");
            if (next.length>0) {
                next.trigger("click");
            } else {
                musicList.find("li:first-child").trigger("click");
            }
        }


    });
}

function searchNow(obj) {
    var search = obj.value;
    music_json = origin_json;
    if (search){
        search = search.toLowerCase();
        music_json = music_json.filter(function(item){
            var searchValue= search ? search.replace(/[\/?<>*|]/g, '_') : search;
            return item["name"].toLowerCase().includes(searchValue) || item["singer"].toLowerCase().includes(searchValue);
        });
    }
    fillDom();
}

function fillDom() {
    var list = $("#music_list");
    list.empty();
    $player.playList.remove();
    $player.playList.add(music_json);
    var template = _.template($("#music_list_item").html());
    $.each($player.playList.all(),function(i,m){
        m["index"] = (i+1);
        if (m["link_lrc"]) {
            m.lyric = new Lyrics(m["link_lrc"]);
        }
        var dom = $(template(m)).get(0);
        dom.index = i;
        dom.music = m;
        list.append(dom);
    })
}

