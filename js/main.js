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
    album_art.find(".cover").attr("src",music.cover || 'data:image/jpeg;base64,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');
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

function getPlayList(){
    var list = $("#music_list");
    $.ajax({
        url: "music.json",
        cache: true,
        success:function(data){
            list.empty();
            console.log(data);
            $player.playList.add(data);
            var template = _.template($("#music_list_item").html());
            $.each($player.playList.all(),function(i,m){
                m["name"] = (i+1) + ". " + m["name"];
                if(m["link_lrc"])m.lyric = new Lyrics(m["link_lrc"]);
                var dom = $(template(m)).get(0);
                dom.index = i;
                dom.music = m;
                list.append(dom);
            })
            console.log("data");

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
                $(this).css("backgroundImage", "url(res/images/pcrl/random.png)");
                break;
            // 随机播放
            case 1:
                $(this).css("backgroundImage", "url(res/images/pcrl/circle.jpg)");
                break;
            // 单曲循环
            case 2:
                $(this).css("backgroundImage", "url(res/images/pcrl/loop.png)");
                break;
            default:
                break;
        }
        mode = (mode == 2) ? 0: mode+1;
    });
    playCtrl.find(".collect").bind("click",function(){
        if ($(this).css("background").includes("res/images/pcrl/collect.png")) {
            $(this).css("backgroundImage", "url(res/images/pcrl/collected.png)");
        } else {
            $(this).css("backgroundImage", "url(res/images/pcrl/collect.png)");
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

