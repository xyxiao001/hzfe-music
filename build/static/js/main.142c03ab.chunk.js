(this["webpackJsonphzfe-music"]=this["webpackJsonphzfe-music"]||[]).push([[0],{211:function(e,t,n){e.exports=n(402)},217:function(e,t,n){},218:function(e,t,n){},219:function(e,t,n){},220:function(e,t,n){},221:function(e,t,n){},223:function(e,t,n){},310:function(e,t){},312:function(e,t){},320:function(e,t,n){},391:function(e,t,n){},395:function(e,t,n){},396:function(e,t,n){},402:function(e,t,n){"use strict";n.r(t);var a,c,r,i,s,l,u,o,m,f=n(0),p=n.n(f),d=n(32),b=n.n(d),g=(n(216),n(217),n(98)),h=n(34),y=n(7),v=n.n(y),E=n(33),j=n(36),O=(n(218),n(54)),N=function(){var e=Object(E.a)(v.a.mark((function e(t){var n,a=arguments;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(n=!(a.length>1&&void 0!==a[1])||a[1],t){e.next=3;break}return e.abrupt("return","");case 3:return e.abrupt("return",new Promise((function(e,a){var c=new FileReader;c.onload=function(t){var a=t.target;e(n?a.result?new Blob([a.result]):null:a.result)},c.onerror=a,n?c.readAsArrayBuffer(t):c.readAsText(t)})));case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),w=function(e){for(var t,n=0,a=e.length,c="";n<a;)t=e.subarray(n,Math.min(n+32768,a)),c+=String.fromCharCode.apply(null,t),n+=32768;return btoa(c)},x=function(e){var t=Math.floor(e/60)||0,n=~~(e-60*t)||0;return(t<10?"0":"")+t+":"+(n<10?"0":"")+n},k=function(e){var t,n=(null===(t=/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/.exec(e))||void 0===t?void 0:t.map((function(e){return e?Number(e):0})))||[];return 60*n[1]+n[2]+(n[4]?n[4]/(2===(n[4]+"").length?100:1e3):0)},P=(n(219),function(e){var t=Object(f.useState)([]),n=Object(j.a)(t,2),a=n[0],c=n[1],r=Object(f.useState)(-1),i=Object(j.a)(r,2),s=i[0],l=i[1],u=Object(f.useRef)(null),o=Object(f.useState)(!0),m=Object(j.a)(o,2),d=m[0],b=m[1],g=Object(f.useState)(0),h=Object(j.a)(g,2),y=h[0],v=h[1];Object(f.useEffect)((function(){c(function(e){var t=e;if(t){for(var n=(t=t.replace(/([^\]^\n])\[/g,(function(e,t){return t+"\n["}))).split("\n"),a=[],c=n.length,r=0;r<c;r++){var i=n[r].match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g),s=n[r].replace(/.*\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g,"").replace(/<(\d{2}):(\d{2})(\.(\d{2,3}))?>/g,"").replace(/^\s+|\s+$/g,"");if(i)for(var l=i.length,u=0;u<l;u++){var o=k(i[u]);a.push({time:o,text:s})}}return(a=a.filter((function(e){return e.text}))).sort((function(e,t){return e.time-t.time})),a}return[]}(e.lrc))}),[e.lrc]),Object(f.useEffect)((function(){l(function(e,t){if(e.length<=0)return-1;for(var n=0;n<e.length&&!(e[n].time>t);)n++;return n-1}(a,e.currentTime)),a.length&&a[s]&&e.setCurrentLrc(a[s].text)}),[s,a,e,e.currentTime]),Object(f.useEffect)((function(){if(u&&d&&e.isPlaying){var t=u.current,n=y*(s-1)||0;t&&t.scrollTo({top:n,behavior:"smooth"})}}),[d,y,s,e.isPlaying]);var E=function(e){return s===e?"choose-lrc":""},O=function(){v(7.5*document.body.offsetHeight/100)};return Object(f.useEffect)((function(){return window.addEventListener("resize",O),O(),function(){window.removeEventListener("resize",O)}}),[]),p.a.createElement("section",{className:"music-lrc",ref:u,onMouseEnter:function(){b(!1)},onMouseLeave:function(){if(e.isPlaying){var t=u.current,n=y*(s-1)||0;t&&t.scrollTo({top:n,behavior:"auto"}),b(!0)}else b(!0)}},p.a.createElement("section",{className:"lrc-list"},a.map((function(t,n){return p.a.createElement("p",{key:"".concat(t.time).concat(s).concat(t.text),style:{color:s===n?e.color:""},className:E(n)},t.text)}))))}),L=(n(220),n(221),n(408)),I=function(e){var t=Object(f.useState)(0),n=Object(j.a)(t,2),a=n[0],c=n[1],r=Object(f.useState)(!1),i=Object(j.a)(r,2),s=i[0],l=i[1];Object(f.useEffect)((function(){s||c(e.range)}),[s,e.range]);return p.a.createElement("section",{className:"progress"},p.a.createElement(L.a,{defaultValue:0,value:a,onChange:function(t){l(!0),e.setChange(!0),c(t),e.handleChanging(t)},onAfterChange:function(t){e.setChange(!1),l(!1)},tooltipVisible:!1}))},M=function(e){var t,n,a=Object(f.useState)(0),c=Object(j.a)(a,2),r=c[0],i=c[1];return Object(f.useEffect)((function(){var t,n=(null===(t=e.currentInfo)||void 0===t?void 0:t.duration)||e.musicPlayingInfo.duration||0;i(e.currentTime/n*100)}),[e.currentInfo,e.currentTime,e.musicPlayingInfo.duration]),p.a.createElement("section",{className:"player-control"},e.min?p.a.createElement("section",{className:"control-min"},p.a.createElement("p",{className:"icon-play-bg",onClick:function(){e.isPlaying?e.handlePause():e.handlePlay()}},e.isPlaying?p.a.createElement("svg",{className:"icon icon-pause","aria-hidden":"true"},p.a.createElement("use",{xlinkHref:"#icon-Pause"})):p.a.createElement("svg",{className:"icon icon-play","aria-hidden":"true"},p.a.createElement("use",{xlinkHref:"#icon-Play"}))),p.a.createElement("section",{className:"control-progress"},p.a.createElement(I,{range:Number(r.toFixed(2)),handleChanging:e.handleChanging,setChange:e.setChange})),p.a.createElement("section",{className:"line-left"},p.a.createElement("span",null," ",x(e.currentTime||0)," "),p.a.createElement("span",null,"/"),p.a.createElement("span",null," ",x((null===(t=e.currentInfo)||void 0===t?void 0:t.duration)||e.musicPlayingInfo.duration||0)," "))):p.a.createElement("section",{className:"control"},p.a.createElement("section",{className:"control-progress"},p.a.createElement(I,{range:Number(r.toFixed(2)),handleChanging:e.handleChanging,setChange:e.setChange})),p.a.createElement("section",{className:"control-line"},p.a.createElement("section",{className:"line-left"},p.a.createElement("span",null," ",x(e.currentTime||0)," "),p.a.createElement("span",null," ",x((null===(n=e.currentInfo)||void 0===n?void 0:n.duration)||e.musicPlayingInfo.duration||0)," ")),p.a.createElement("section",{className:"line-center"},p.a.createElement("p",{className:"icon-play-bg",onClick:function(){e.isPlaying?e.handlePause():e.handlePlay()}},e.isPlaying?p.a.createElement("svg",{className:"icon icon-pause","aria-hidden":"true"},p.a.createElement("use",{xlinkHref:"#icon-Pause"})):p.a.createElement("svg",{className:"icon icon-play","aria-hidden":"true"},p.a.createElement("use",{xlinkHref:"#icon-Play"})))))))},C=(n(223),function(e){var t=Object(f.useState)([]),n=Object(j.a)(t,2),a=n[0],c=n[1],r=Object(f.useState)(-1),i=Object(j.a)(r,2),s=i[0],l=i[1],u=Object(f.useRef)(null),o=Object(f.useState)(!0),m=Object(j.a)(o,2),d=m[0],b=m[1],g=Object(f.useState)({backgroundImage:""}),h=Object(j.a)(g,2),y=h[0],v=h[1],E=Object(f.useState)(0),O=Object(j.a)(E,2),N=O[0],w=O[1];Object(f.useEffect)((function(){c(function(e){var t=[];console.log("\u8fdb\u5165\u9010\u5b57\u89e3\u6790\u7684\u6b4c\u8bcd\u54e6");for(var n=e.split("\n"),a=0;a<n.length;){var c=n[a].replace(/\s/g,""),r=c.match(/\[(\d{2}):(\d{2})(\.(\d{2,3}))?]/g),i=c.match(/(?<=\])\S\s?(?=\[)/g);if(r&&i){for(var s=[],l=0;l<i.length;l++)s.push({text:i[l],start:k(r[l]),end:k(r[l+1])});t.push(s)}a++}return t}(e.lrc))}),[e.lrc]),Object(f.useEffect)((function(){if(l(function(e,t){if(e.length<=0)return-1;for(var n=0;n<e.length&&!(e[n][0].start>t);)n++;return n-1}(a,e.currentTime)),a[s]&&a[s].length){var t=a[s].map((function(e){return e.text}));e.setCurrentLrc(t.join(""))}var n=function(e,t){if(!e)return 0;for(var n=0,a=0;a<e.length&&!(e[a].start>t);)a++;if(a<=0)return 0;if(a>=e.length)return 100;n=a*(100/e.length);var c=e[a-1];if(t>=c.end)return 100;if(t<=c.start)return(a-1)*(100/e.length);var r=c.end-c.start;return n+=(t-c.start)/r*(100/e.length)}(a[s],e.currentTime);v({backgroundImage:"-webkit-linear-gradient(left,".concat(e.color," ").concat(n,"%,#ffffff ").concat(n,"%)")})}),[s,a,e,e.currentTime]),Object(f.useEffect)((function(){if(u&&d&&e.isPlaying){var t=u.current,n=N*(s-1)||0;t&&t.scrollTo({top:n,behavior:"smooth"})}}),[d,N,s,e.isPlaying]);var x=function(e){return s===e?"choose-lrc-line":""},P=function(){w(7.5*document.body.offsetHeight/100)};return Object(f.useEffect)((function(){return window.addEventListener("resize",P),P(),function(){window.removeEventListener("resize",P)}}),[]),p.a.createElement("section",{className:"music-lrc-word",ref:u,onMouseEnter:function(){b(!1)},onMouseLeave:function(){if(b(!0),e.isPlaying){var t=u.current,n=N*(s-1)||0;t&&t.scrollTo({top:n,behavior:"auto"})}}},p.a.createElement("section",{className:"lrc-list"},a.map((function(e,t){return p.a.createElement("section",{key:t,className:"lrc-line"},p.a.createElement("p",{className:x(t),style:s===t?y:{}},e.map((function(e,t){return p.a.createElement("span",{key:t},e.text)}))))}))))}),T=n(197),z=n(160),S=n(49),D=n.n(S),R=function(){var e=Object(E.a)(v.a.mark((function e(t){var n;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"music-lrc-list",e.next=3,D.a.getItem("music-lrc-list");case 3:if(e.t0=e.sent,e.t0){e.next=6;break}e.t0=[];case 6:return n=e.t0,n.every((function(e){return e.fileName!==t.fileName}))&&n.push(t),e.abrupt("return",D.a.setItem("music-lrc-list",n));case 10:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),A=function(){var e=Object(E.a)(v.a.mark((function e(){var t;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"music-lrc-list",e.next=3,D.a.getItem("music-lrc-list");case 3:if(e.t0=e.sent,e.t0){e.next=6;break}e.t0=[];case 6:return t=e.t0,e.abrupt("return",t);case 8:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),H=function(){var e=Object(E.a)(v.a.mark((function e(t,n){var a,c;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"music-list",e.next=3,D.a.getItem("music-list");case 3:if(e.t0=e.sent,e.t0){e.next=6;break}e.t0=[];case 6:if(a=e.t0,!a.every((function(e){return e.fileName!==t.fileName}))){e.next=14;break}return c="".concat(t.fileName,"-").concat(100*Math.random(),"-").concat(Date.now()),t.id=c,e.next=13,D.a.setItem(c,n);case 13:a.push(t);case 14:return e.abrupt("return",D.a.setItem("music-list",a));case 15:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}(),K=function(){var e=Object(E.a)(v.a.mark((function e(){var t;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return"music-list",e.next=3,D.a.getItem("music-list");case 3:if(e.t0=e.sent,e.t0){e.next=6;break}e.t0=[];case 6:return t=e.t0,e.abrupt("return",t);case 8:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),F=function(){var e=Object(E.a)(v.a.mark((function e(t){return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise(function(){var e=Object(E.a)(v.a.mark((function e(n,a){var c,r;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,D.a.getItem("music-list");case 2:if(e.t0=e.sent,e.t0){e.next=5;break}e.t0=[];case 5:if(c=e.t0,r=c.filter((function(e){return e.id===t}))[0]){e.next=11;break}a("\u83b7\u53d6\u6b4c\u66f2\u4fe1\u606f\u5931\u8d25"),e.next=20;break;case 11:return e.next=13,D.a.getItem(t);case 13:if(r.music=e.sent,!r.lrcKey){e.next=19;break}return e.next=17,A();case 17:e.sent.forEach((function(e){e.fileName===r.lrcKey&&(r.lrc=e.content)}));case 19:n(r);case 20:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}()));case 1:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),U=n(404),B=n(99),q=n(161),J=n(73),V=n(132),Z=n(133),$=n(51),G=(n(224),n(20)),Q=n(198),W=new(a=function(){function e(){var t=this;Object(V.a)(this,e),Object(J.a)(this,"musicPlayer",c,this),this.handlePlay=function(){var e,n,a;(console.log("\u6b4c\u66f2\u64ad\u653e\u4e86"),t.updatedMusicData({currentTime:null===(e=t.musicPlayer)||void 0===e?void 0:e.seek(),duration:null===(n=t.musicPlayer)||void 0===n?void 0:n.duration(),playing:!0,change:!1}),t.musicInfo&&!t.musicInfo.duration)&&(t.musicInfo.duration=Number(null===(a=t.musicPlayer)||void 0===a?void 0:a.duration()))},this.handlePause=function(){var e;console.log("\u6b4c\u66f2\u6682\u505c\u4e86"),t.updatedMusicData({currentTime:null===(e=t.musicPlayer)||void 0===e?void 0:e.seek(),playing:!1})},this.handleEnd=function(){var e;console.log("\u6b4c\u66f2\u64ad\u653e\u5b8c\u4e86"),t.updatedMusicData({currentTime:null===(e=t.musicPlayer)||void 0===e?void 0:e.seek(),playing:!1}),requestAnimationFrame(t.handlePlaying)},this.handleStop=function(){var e;console.log("\u6b4c\u66f2\u505c\u6b62"),t.updatedMusicData({currentTime:null===(e=t.musicPlayer)||void 0===e?void 0:e.seek(),playing:!1})},this.handlePlaying=function(){!t.musicData.change&&t.musicPlayer&&t.musicPlayer.playing()&&(t.updatedMusicData({type:"update",currentTime:t.musicPlayer.seek()}),requestAnimationFrame(t.handlePlaying))},Object(J.a)(this,"musicInfo",r,this),Object(J.a)(this,"musicData",i,this),Object(J.a)(this,"localMusicList",s,this),Object(J.a)(this,"localMusicLoading",l,this),Object(J.a)(this,"updateLocalMusicList",u,this),this.localMusicLrcList=[],Object(J.a)(this,"localMusicLrcLoading",o,this),Object(J.a)(this,"updateLocalMusicLrcList",m,this)}return Object(Z.a)(e,[{key:"createdPlayer",value:function(){this.musicInfo&&(this.updatedMusicData({playing:!1}),this.musicPlayer=new Q.Howl({autoplay:!0,src:URL.createObjectURL(this.musicInfo.music),html5:!0,format:[this.musicInfo.codec.toLowerCase()||String(this.musicInfo.fileType).toLowerCase()],volume:1,onplay:this.handlePlay,onpause:this.handlePause,onend:this.handleEnd,onstop:this.handleStop}))}},{key:"destroyPlayer",value:function(){this.musicPlayer=null}},{key:"updatedMusicInfo",value:function(e){0===e.picture.length&&(e.picture=["".concat(".","/images/music-no.jpeg")]),this.musicInfo=e}},{key:"updatedMusicData",value:function(e){var t=this;"update"!==e.type?(e.hasOwnProperty("min")&&(e.min?document.body.classList.remove("dialog-screen"):document.body.classList.add("dialog-screen")),e.change||setTimeout((function(){requestAnimationFrame(t.handlePlaying)}),100),this.musicData=Object(q.a)(Object(q.a)({},this.musicData),e)):this.musicData.currentTime=e.currentTime}}]),e}(),c=Object($.a)(a.prototype,"musicPlayer",[G.m],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),Object($.a)(a.prototype,"createdPlayer",[G.f],Object.getOwnPropertyDescriptor(a.prototype,"createdPlayer"),a.prototype),Object($.a)(a.prototype,"destroyPlayer",[G.f],Object.getOwnPropertyDescriptor(a.prototype,"destroyPlayer"),a.prototype),r=Object($.a)(a.prototype,"musicInfo",[G.m],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return null}}),Object($.a)(a.prototype,"updatedMusicInfo",[G.f],Object.getOwnPropertyDescriptor(a.prototype,"updatedMusicInfo"),a.prototype),i=Object($.a)(a.prototype,"musicData",[G.m],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return{id:"",playing:!1,duration:0,currentTime:0,change:!1,min:!0}}}),Object($.a)(a.prototype,"updatedMusicData",[G.f],Object.getOwnPropertyDescriptor(a.prototype,"updatedMusicData"),a.prototype),s=Object($.a)(a.prototype,"localMusicList",[G.m],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return[]}}),l=Object($.a)(a.prototype,"localMusicLoading",[G.m],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return!1}}),u=Object($.a)(a.prototype,"updateLocalMusicList",[G.f],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){var e=this;return Object(E.a)(v.a.mark((function t(){return v.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e.localMusicLoading=!0,t.next=3,K();case 3:e.localMusicList=t.sent,e.localMusicLoading=!1;case 5:case"end":return t.stop()}}),t)})))}}),o=Object($.a)(a.prototype,"localMusicLrcLoading",[G.m],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){return!1}}),m=Object($.a)(a.prototype,"updateLocalMusicLrcList",[G.f],{configurable:!0,enumerable:!0,writable:!0,initializer:function(){var e=this;return Object(E.a)(v.a.mark((function t(){return v.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return e.localMusicLrcLoading=!0,t.next=3,A();case 3:e.localMusicLrcList=t.sent,e.localMusicLrcLoading=!1;case 5:case"end":return t.stop()}}),t)})))}}),a),X=new T.a,Y=Object(B.a)((function(){var e,t=W.musicPlayer,n=W.musicInfo,a=W.musicData,c=Object(f.useState)("#1890ff"),r=Object(j.a)(c,2),i=r[0],s=r[1],l=Object(f.useState)(""),u=Object(j.a)(l,2),o=u[0],m=u[1],d=Object(f.useRef)(!1),b=function(e){var t=((null===n||void 0===n?void 0:n.duration)||0)*e/100;W.updatedMusicData({currentTime:t})},g=function(e){e||(null===t||void 0===t||t.seek(a.currentTime),a.playing||null===t||void 0===t||t.play()),W.updatedMusicData({change:e})},h=Object(f.useCallback)(Object(E.a)(v.a.mark((function e(){return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",new Promise(function(){var e=Object(E.a)(v.a.mark((function e(t,n){var c;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,F(a.id);case 2:(c=e.sent)?t(c):n("\u6b4c\u66f2\u64ad\u653e\u83b7\u53d6\u5931\u8d25");case 4:case"end":return e.stop()}}),e)})));return function(t,n){return e.apply(this,arguments)}}()));case 1:case"end":return e.stop()}}),e)}))),[a.id]),y=Object(f.useCallback)((function(){t&&(t.playing()?t.pause():t.play())}),[t]),O=Object(f.useCallback)(Object(E.a)(v.a.mark((function e(){var t;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:if(a.id){e.next=2;break}return e.abrupt("return");case 2:return e.next=4,h();case 4:if(t=e.sent){e.next=7;break}return e.abrupt("return");case 7:W.updatedMusicInfo(t),X.getColorAsync(t.picture[0]).then((function(e){s(Object(z.b)(.8,Object(z.a)(.5,e.rgba)))})).catch((function(e){s("#1890ff")}));case 9:case"end":return e.stop()}}),e)}))),[h,a.id]),N=Object(f.useCallback)((function(e){e.preventDefault(),32===e.keyCode&&y()}),[y]),w=function(){W.updatedMusicData({min:!a.min})};return Object(f.useEffect)((function(){console.log("useEffect-getMusicInfo"),O()}),[O]),Object(f.useEffect)((function(){return console.log("useEffect-create"),n&&!t&&(console.log("\u521b\u5efa\u97f3\u4e50\u5b9e\u4f8b"),W.createdPlayer()),function(){t&&(console.log("created destroy"),W.updatedMusicData({playing:!1}),W.destroyPlayer())}}),[n,t]),Object(f.useEffect)((function(){console.log("music-change-key"),d.current=a.change}),[a.change]),Object(f.useEffect)((function(){return window.addEventListener("keydown",N),function(){window.removeEventListener("keydown",N)}}),[N]),p.a.createElement("section",{className:"player"},a.min?p.a.createElement("section",{className:"player-min",style:{color:i}},n?p.a.createElement("section",{className:"player-layout"},p.a.createElement("section",{className:"layout-left"},p.a.createElement("section",{className:"music-img",onClick:w},p.a.createElement("img",{src:n.picture.length>0?n.picture[0]:"./images/music-no.jpeg",alt:""})),p.a.createElement("section",{className:"player-info"},p.a.createElement("p",{className:"music-name"},n.name),p.a.createElement("p",{className:"music-artist"},n.artist," - ",n.album))),p.a.createElement("section",{className:"music-progress"},p.a.createElement(M,{handlePlay:y,handlePause:y,currentInfo:n||null,musicPlayingInfo:a,currentTime:a.currentTime,handleChanging:b,setChange:g,min:a.min,isPlaying:a.playing}))):p.a.createElement("section",{className:"player-layout"},"\u8bf7\u9009\u62e9\u6b4c\u66f2\u8fdb\u884c\u64ad\u653e")):p.a.createElement("section",{className:"player-max"},p.a.createElement("section",{className:"status-control",onClick:w},p.a.createElement(U.a,null)),p.a.createElement("section",{className:"player-bg",style:{backgroundImage:"url(".concat((null===n||void 0===n?void 0:n.picture[0])||"./images/music-no.jpeg",")")}}),p.a.createElement("section",{className:"player-fade"}),p.a.createElement("section",{className:"player-layout"},n?p.a.createElement("section",{className:"player-box"},p.a.createElement("section",{className:"player-left"},p.a.createElement("section",{className:"player-line"},p.a.createElement("img",{src:n.picture.length>0?n.picture[0]:"./images/music-no.jpeg",alt:""})),p.a.createElement("section",{className:"player-line"},p.a.createElement("section",{className:"player-info"},p.a.createElement("p",{className:"music-name"},n.name),p.a.createElement("p",{className:"music-artist"},n.artist," - ",n.album),p.a.createElement("p",{className:"music-current-lrc"},o))),p.a.createElement(M,{handlePlay:y,handlePause:y,currentInfo:n||null,musicPlayingInfo:a,currentTime:a.currentTime,handleChanging:b,setChange:g,isPlaying:a.playing})),p.a.createElement("section",{className:"player-right"},(null===(e=n.lrc)||void 0===e?void 0:e.match(/\](\S)\[/g))?p.a.createElement(C,{setCurrentLrc:m,color:i,lrc:n.lrc||"",currentInfo:n||null,currentTime:a.currentTime,isPlaying:a.playing}):p.a.createElement(P,{setCurrentLrc:m,color:i,lrc:n.lrc||"",currentInfo:n||null,currentTime:a.currentTime,isPlaying:a.playing}))):"")))})),_=n(199),ee=n(209),te=n(406),ne=n(63),ae=n(410),ce=(n(320),["mp3","ogg","wav","aac","flac","dolby","opus","webm","alac"]),re=["lrc","txt"],ie=n(156),se=n.n(ie),le=function(){var e=function(){var e=Object(E.a)(v.a.mark((function e(t){var n,a,c,r,i,s;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.name.split("."),a=n[n.length-1],c=t.name.replace(".".concat(a),""),e.prev=3,e.next=6,N(t,!0);case 6:return r=e.sent,e.next=9,_.parseBlob(r);case 9:i=e.sent,e.next=16;break;case 12:return e.prev=12,e.t0=e.catch(3),ee.b.warning("\u76ee\u524d\u8fd8\u4e0d\u652f\u6301\u5904\u7406".concat(a,"\u8fd9\u79cd\u7c7b\u578b\u6587\u4ef6\uff0c").concat(c)),e.abrupt("return");case 16:l=i,(s={name:Object(O.get)(l,"common.title",""),album:Object(O.get)(l,"common.album",""),albumartist:Object(O.get)(l,"common.albumartist",""),artist:Object(O.get)(l,"common.artist",""),artists:Object(O.get)(l,"common.artists",[]),comment:Object(O.get)(l,"common.comment",[]),date:Object(O.get)(l,"common.date",0),picture:Object(O.get)(l,"common.picture",[]).map((function(e){return"data:".concat(e.format,";base64,").concat(w(e.data))})),codec:Object(O.get)(l,"format.codec",""),duration:Object(O.get)(l,"format.duration",0),sampleRate:Object(O.get)(l,"format.sampleRate",""),lrc:""}).fileName=c,s.fileType=a,s.fileSize=se()(t.size),s.size=t.size,s.name=s.name||s.fileName||"\u672a\u77e5\u6b4c\u66f2",H(s,r).then((function(e){console.log(e),ee.b.success("".concat(t.name,"  \u4e0a\u4f20\u6210\u529f")),W.updateLocalMusicList()}));case 23:case"end":return e.stop()}var l}),e,null,[[3,12]])})));return function(t){return e.apply(this,arguments)}}(),t=function(){var e=Object(E.a)(v.a.mark((function e(t){var n,a,c,r;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return n=t.name.split("."),a=n[n.length-1],c=t.name.replace(".".concat(a),""),r="",e.prev=4,e.next=7,N(t,!1);case 7:r=e.sent,e.next=14;break;case 10:return e.prev=10,e.t0=e.catch(4),ee.b.warning("\u76ee\u524d\u8fd8\u4e0d\u652f\u6301\u5904\u7406".concat(a,"\u8fd9\u79cd\u7c7b\u578b\u6587\u4ef6\uff0c").concat(c)),e.abrupt("return");case 14:R({content:r,fileName:c,fileType:a,size:t.size,fileSize:se()(t.size)}).then((function(e){console.log(e),ee.b.success("".concat(t.name,"  \u4e0a\u4f20\u6210\u529f"))}));case 15:case"end":return e.stop()}}),e,null,[[4,10]])})));return function(t){return e.apply(this,arguments)}}();return p.a.createElement("section",{className:"page-upload"},p.a.createElement("section",{className:"upload-line"},p.a.createElement(te.a,{beforeUpload:function(n){var a=n.name.split("."),c=a[a.length-1],r=n.name.replace(".".concat(c),"");return ce.includes(c)?(console.log("\u5f53\u524d\u662f\u97f3\u9891\u6587\u4ef6\u5904\u7406",r,c),e(n),!1):re.includes(c)?(console.log("\u5f53\u524d\u662f\u6b4c\u8bcd\u6587\u4ef6\u5904\u7406",r,c),t(n),!1):(ee.b.warning("\u76ee\u524d\u8fd8\u4e0d\u652f\u6301\u5904\u7406".concat(c,"\u8fd9\u79cd\u7c7b\u578b\u6587\u4ef6\uff0c").concat(r)),!1)},showUploadList:!1,accept:function(){var e=ce.concat(re);return(e=e.map((function(e){return e=".".concat(e)}))).join(",")}(),multiple:!0},p.a.createElement(ne.a,{icon:p.a.createElement(ae.a,null)},"\u70b9\u51fb\u4e0a\u4f20\u672c\u5730\u6b4c\u66f2\u6216\u8005\u6b4c\u8bcd")),p.a.createElement("p",{className:"tips"},p.a.createElement("span",null,"\u652f\u6301\u6b4c\u66f2\u683c\u5f0f ",ce.join("\uff0c")),p.a.createElement("span",null,"\u652f\u6301\u6b4c\u8bcd\u683c\u5f0f ",re.join("\uff0c")))))},ue=n(407),oe=n(405),me=Object(B.a)((function(){var e=W.localMusicLrcList,t=W.localMusicLrcLoading;return Object(f.useEffect)((function(){console.log("\u83b7\u53d6\u6b4c\u8bcd\u5217\u8868"),W.updateLocalMusicLrcList()}),[]),p.a.createElement("section",{className:"lrc-list"},p.a.createElement(oe.a,{dataSource:e,columns:[{title:"\u6b4c\u8bcd\u540d",dataIndex:"fileName",key:"fileName"},{title:"\u5927\u5c0f",dataIndex:"fileSize",key:"fileSize",sorter:function(e,t){return e.size-t.size}}],pagination:!1,rowKey:"fileName",loading:t}))})),fe=n(409),pe=n(411),de=n(412),be=(n(391),Object(B.a)((function(){var e=W.musicData,t=W.localMusicList,n=W.localMusicLoading,a=[{title:"\u6b4c\u66f2",dataIndex:"name",key:"name",render:function(t,n){return p.a.createElement("p",{className:"list-play"},(null===e||void 0===e?void 0:e.id)===n.id&&e.playing?p.a.createElement("span",null,p.a.createElement(pe.a,{className:"icon",onClick:function(){return r()}})):p.a.createElement("span",null,p.a.createElement(de.a,{className:"icon",onClick:function(){return c(n)}})),p.a.createElement("span",null,t))}},{title:"\u6b4c\u624b",dataIndex:"artist",key:"artist"},{title:"\u4e13\u8f91",dataIndex:"album",key:"album"},{title:"\u65f6\u957f",dataIndex:"duration",key:"duration",render:function(e){return x(e)||"\u672a\u77e5"},sorter:function(e,t){return Number(e.duration)-Number(t.duration)}},{title:"\u683c\u5f0f",dataIndex:"codec",key:"codec",render:function(e,t){return e||t.fileType}},{title:"\u5927\u5c0f",dataIndex:"fileSize",key:"fileSize",sorter:function(e,t){return Number(e.size)-Number(t.size)}},{title:"\u5173\u8054\u6b4c\u8bcd\u540d",dataIndex:"lrcKey",key:"lrcKey",render:function(e,t){return e||p.a.createElement(fe.b,{size:"middle"},p.a.createElement("span",{className:"action"},"\u5173\u8054\u6b4c\u8bcd"))}}],c=function(t){var n;t.id!==e.id?(null===(n=W.musicPlayer)||void 0===n||n.stop(),setTimeout((function(){W.updatedMusicData({id:t.id})}),100)):W.musicPlayer&&W.musicPlayer.play()},r=function(){var e;null===(e=W.musicPlayer)||void 0===e||e.pause()};return Object(f.useEffect)((function(){console.log("\u83b7\u53d6\u97f3\u4e50\u5217\u8868"),W.updateLocalMusicList()}),[]),p.a.createElement("section",{className:"lrc-list"},p.a.createElement(oe.a,{dataSource:t,columns:a,pagination:!1,rowKey:"fileName",loading:n}))}))),ge=ue.a.TabPane,he=function(){var e=Object(h.f)(),t=new URLSearchParams(Object(h.g)().search),n=Object(h.g)(),a=Object(f.useState)(""),c=Object(j.a)(a,2),r=c[0],i=c[1],s=function(){var e=Object(E.a)(v.a.mark((function e(){return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,new Promise(function(){var e=Object(E.a)(v.a.mark((function e(t,n){var a,c;return v.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,K();case 3:return a=e.sent,e.next=6,A();case 6:return c=e.sent,a=a.map((function(e){return c.forEach((function(t){t.fileName.includes(e.name)&&(e.lrcKey=t.fileName)})),e})),e.next=10,D.a.setItem("music-list",a);case 10:t("success"),e.next=16;break;case 13:e.prev=13,e.t0=e.catch(0),n(e.t0);case 16:case"end":return e.stop()}}),e,null,[[0,13]])})));return function(t,n){return e.apply(this,arguments)}}());case 2:ee.b.success("\u5173\u8054\u6210\u529f"),W.updateLocalMusicList(),W.updateLocalMusicLrcList();case 5:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(f.useEffect)((function(){if(t){var e=t.get("type")||"";["music","lrc"].includes(e)?i(e):i("music")}}),[t]),p.a.createElement("section",{className:"page-local"},p.a.createElement("section",{className:"local-upload"},p.a.createElement(le,null),p.a.createElement("section",null,p.a.createElement(ne.a,{onClick:s},"\u81ea\u52a8\u5173\u8054\u6b4c\u8bcd"),p.a.createElement("p",{className:"tips"},"\u5173\u8054\u89c4\u5219: \u5f53\u524d\u6b4c\u66f2\u6ca1\u6709\u6b4c\u8bcd\uff0c\u540c\u65f6\u53ef\u4ee5\u627e\u5230\u6b4c\u8bcd\u540d\uff0c\u5305\u542b\u5b8c\u6574\u6b4c\u66f2\u540d"))),p.a.createElement("section",{className:"local-content"},p.a.createElement(ue.a,{activeKey:r,onChange:function(t){e.push("".concat(n.pathname,"?type=").concat(t))}},p.a.createElement(ge,{tab:"\u97f3\u4e50\u5217\u8868",key:"music"},p.a.createElement(be,null)),p.a.createElement(ge,{tab:"\u6b4c\u8bcd\u5217\u8868",key:"lrc"},p.a.createElement(me,null)))))},ye=function(){return p.a.createElement("p",null,"Love")},ve=(n(395),function(){return p.a.createElement("section",{className:"page-home"},p.a.createElement("section",{className:"wrapper-box"},p.a.createElement("section",{className:"nav"},p.a.createElement("p",{className:"nav-item"},p.a.createElement(g.b,{to:"/",exact:!0},"\u63a8\u8350")),p.a.createElement("p",{className:"nav-item"},p.a.createElement(g.b,{to:"/local"},"\u672c\u5730\u97f3\u4e50"))),p.a.createElement("section",{className:"music-box"},p.a.createElement(h.c,null,p.a.createElement(h.a,{path:"/local",exact:!0},p.a.createElement(he,null)),p.a.createElement(h.a,{path:"/",exact:!0},p.a.createElement(ye,null))))),p.a.createElement(Y,null))});n(396);var Ee=function(){return p.a.createElement("section",{className:"hzfe-music"},p.a.createElement(g.a,null,p.a.createElement(h.c,null,p.a.createElement(h.a,{path:"/",exact:!0},p.a.createElement(ve,null)),p.a.createElement(h.a,{path:"*",exact:!0},p.a.createElement(ve,null)))))},je=n(28),Oe=n(206),Ne=n.n(Oe);D.a.config({name:"HZFE-MUSIC"}),b.a.render(p.a.createElement(je.a,{locale:Ne.a},p.a.createElement(Ee,null)),document.getElementById("root"))}},[[211,1,2]]]);
//# sourceMappingURL=main.142c03ab.chunk.js.map