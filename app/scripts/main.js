
$(document).ready(function(){

	//Web page fade in
	TweenLite.to($('body'), .3, {opacity: 1, ease: Power1.easeInOut});

	/**************** Parameters ****************/

	var position = 0;
	var position_move = 0;

	var mode = "navigation";

	//navigation mode
	var stage = 1;
	var level = 1;

	//addfolder mode
	var folder_level = 1;
	var total_level = 2;
	var applistposition = 1;
	var appselected = 0;
	var apptotal = 0;

	//rearrange mode
	var currentposition = 0;

	var setting = ["#search", "#setting", "#folder"];
	var setting_stage = 1;

	var optionlist = ["#rearrange", "#rename", "#remove"];
	var option_stage = 1;

	var deletelist = ["#cancel", "#confirm"];
	var delete_stage = 1;

	var colors = {"app01": "#d90070", "app02": "#00cbb0", "app03": "#0071d7", "app04":"#00a6d5", "app05":"#cccccc", "app06":"#cccccc", "app07":"#cccccc", "app08":"#cccccc", "app09":"#5a5a5a",  "app10":"#5a5a5a"};
	var pressed = "#5eabd9";

	//All checking flag
	var flag = false;

	var checkcolorchange = true;
	var checkrearrange = true;
	var starttv = false;

	// Speeds
	var scale_speed = .3;
	var slide_speed = .3;
	var trans_speed = 1.8;

	var count = $('#app > .appbutton').length;
  var total = count;

	var arrow_next = 515 + (8-count)*0.5*(150+10);
	var arrow_prev = 235 + (8-count)*0.5*(150+10);

	/**************** Display Time ****************/

	var d = new Date();
	var h = ("0"+d.getHours()).slice(-2);
	var m = ("0"+d.getMinutes()).slice(-2);

	var time = h+":"+m;
	$('#time').text(time);

	setInterval(function() {
		var d = new Date();
		var h = ("0"+d.getHours()).slice(-2);
		var m = ("0"+d.getMinutes()).slice(-2);

		var time = h+":"+m;
		$('#time').text(time);
	}, 60 * 1000); // 60 * 1000 milsec

	// Animation Loops
	var tl1 = new TimelineMax({repeat:-1});
	var tl2 = new TimelineMax({repeat:-1});
	var wave = new TimelineMax({repeat:-1});

	/**************** Assign Color to Apps + Align Apps & Folder Cards ****************/

	for (var i = 0; i < Object.keys(colors).length; i++){
		var $getapp = $('.appbutton[data-number='+(i+1)+']');
		$getapp.css('background-color',colors['app0'+(i+1)]);
	}

	if(count <= 5) {
		for ( var i = 0; i < count; i++ ) {
			var $getapp = $('.appbutton[data-number='+(i+1)+']');
	    $getapp.css('margin-left',(1920-300*count)/2+i*(300+100/count)-40);
		}
	} else {
		for ( var i = 0; i < count; i++ ) {
	    var $getapp = $('.appbutton[data-number='+(i+1)+']');
			$getapp.css('margin-left',(1920-300*5)/2+i*(300+100/5)-40);
		}
	}

	$('.appbutton-folder').each(function(){
		var appfolderid = $(this).attr('data-number').split('-')[1];
		$(this).css('margin-left', 150*(appfolderid-1) + '!important');
	});


	/**************** Initial Settings ****************/

	//1. Transition In
	var $app = $('.appbutton');
	var time = 100;
	$app.each(function(index, element){
		setTimeout( function(){
			//console.log(element);
			TweenLite.to(element, .8, {opacity:1, y:'-=100', ease: Power4.easeInOut});
		}, time);
		time+=100;
	});

	//2. Highlight App01
	$(window).on("blur focus", function(e) {
	    var prevType = $(this).data("prevType");
			var $getapp = $('.appbutton[data-number='+stage+']');
	    if (prevType != e.type) {   //  reduce double fire issues
	        switch (e.type) {
	            case "blur":
	            	if(option){
	                	$(optionlist[option_stage-1]).notSelected_option();
	                }
	                else if(mode == "navigation"){
		            	if(level == 1){
		                	$getapp.notSelected();
		                }
		                else if(level == 0){
		                	$(setting[setting_stage-1]).notSelected_setting();
		                }
		                else {
		                	$('#filter').notSelected_setting();
		                }
		            }

	                break;
	            case "focus":
	                // do work
	                if(option){
	                	$(optionlist[option_stage-1]).isSelected_option();
	                }
	                else if(mode == "navigation"){
		                if(level == 1){
		                	$getapp.isSelected();
		                }
		                else if(level == 0){
		                	$(setting[setting_stage-1]).isSelected_setting();
		                }
		                else {
		                	$('#filter').isSelected_setting();
		                }
		            }
	                break;
	        }
	    }
	    $(this).data("prevType", e.type);
	});

	TweenLite.to($('#app01'), scale_speed, {scale:1.6, zIndex: 10, border: '6px #FFF solid', ease: Power1.easeInOut, delay: (count*160)/1000, onComplete: function(){
		// Finish Loading
		flag = true;

		// Animate Waves
		wave[0] = new TimelineMax({repeat:-1});
		wave[1] = new TimelineMax({repeat:-1});

		wave[0].fromTo($('.wave01a'), 3, {x:'0px'},{x:'-570px', ease: Linear.easeNone});
		wave[1].fromTo($('.wave01b'), 3.1, {x:'-100px'},{x:'-670px', ease: Linear.easeNone});

		$('#app01').addClass('selected');
	}});

	//3. Set Colors
	var $currentID = ($('.appbutton[data-number='+stage+']').attr('id'));
	TweenLite.to($('.transition'), .001, {backgroundColor: colors[$currentID]});
	TweenLite.to($('#dummy'), .001, {backgroundColor: colors[$currentID]});


	/**************** Functions ****************/

	(function( $ ){
   		$.fn.getMode = function() {
      		console.log(mode);
      		return mode;
   		};
	})( jQuery );

	/*todolist:

	1. group all isSelected && notSeleted + combine with pressed & release?
	2. modularize transition opening + closing without anything else x 2
	3. modularize option circles showing in & leaving out x 2
	4. make sure every timing is the same for the same type of transition. (cleanup all the settimeout)
	5. function for add folder page showing & leaving //addfoldermode
	6. function for delete confirm page showing & leaving  //deletemode
	7. function for entering & leaving rearrange mode
	8. cleanup all the checking situations

	think about what would be useful to continue using this prototype & modifiying this prototype
	(think of all the interaction as components, what can be used again and again?)

	*/

	(function( $ ){
   		$.fn.isSelected = function(s) {
   			s = s || 1.6;
    		TweenLite.to(this, scale_speed, {scale:s, zIndex: 10, border: '6px #FFF solid', ease: Power4.easeInOut, perspective: 1000, onComplete:function(){
    			flag = true;
    		}});
    		this.addClass('selected');

    		if(mode == "navigation"){
					console.log('start wave');

					var id = $(this).attr('id');
					TweenLite.to($("#"+id+" > .appbutton-folder"), .3, {opacity: 1});

    			var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
    			var appid = $current.attr('id').split('0')[1];

      		if(wave[appid*2-2]!=null) wave[appid*2-2].resume();
      		else {
      			wave[appid*2-2] = new TimelineMax({repeat:-1});
      			wave[appid*2-2].fromTo($('.wave0'+appid+'a'), 3, {x:'0px'},{x:'-570px', ease: Linear.easeNone});
      		}
      		if(wave[appid*2-1]!=null) wave[appid*2-1].resume();
      		else {
      			wave[appid*2-1] = new TimelineMax({repeat:-1});
      			wave[appid*2-1].fromTo($('.wave0'+appid+'b'), 3.1, {x:'-100px'},{x:'-670px', ease: Linear.easeNone});
      		}
      	}
    		return this;
   		};
	})( jQuery );
	(function( $ ){
   		$.fn.notSelected = function(s) {
   			s = s || 1;
				if(mode == "navigation"){
					var id = $(this).attr('id');
					TweenLite.to($("#"+id+" > .appbutton-folder"), .3, {opacity: 0});
				}
    		TweenLite.to(this, scale_speed, {scale:s, zIndex: 1, border: '0px #989898 solid', ease: Power4.easeInOut, onComplete: function(){
					//flag = true;
				}});
    		this.removeClass('selected');
    		return this;
   		};
	})( jQuery );
	(function( $ ){
   		$.fn.isSelected_setting = function() {
      		TweenLite.to(this, .3, {scale: 1.1, backgroundColor: 'rgba(255,255,255,1)', ease: Power2.easeInOut, perspective: 1000, onComplete: function(){
						flag = true;
					}});
      		this.addClass('selected');
      		return this;
   		};
	})( jQuery );
	(function( $ ){
   		$.fn.notSelected_setting = function() {
      		TweenLite.to(this, .2, {scale:1, zIndex: 1, backgroundColor: 'rgba(0,0,0,.8)', ease: Power2.easeInOut, onComplete: function(){
						//flag = true;
					}});
      		this.removeClass('selected');
      		return this;
   		};
	})( jQuery );
	(function( $ ){
   		$.fn.isSelected_option = function(t) {
   			t = t || .4;
				TweenLite.to(this, t, {backgroundColor:'rgb(255,255,255)',scale:1.3, ease: Power4.easeInOut, perspective: 1000, onComplete: function(){
					flag = true;
				}});
				this.addClass('selectedOption');
				console.log("red == 1");
      	return this;
   		};
	})( jQuery );
	(function( $ ){
   		$.fn.notSelected_option = function(t) {
   			t = t || .4;
    		TweenLite.to(this, t, {backgroundColor:'rgb(96,96,96)',scale:1, ease: Power4.easeInOut, onComplete: function(){
					//flag = true;
				}});
    		this.removeClass('selectedOption');
      	return this;
   		};
	})( jQuery );
	(function( $ ){
   		$.fn.findNext = function(d) {
   			var $app = $('#app > .appbutton');
   			var $current = $('#app > .appbutton[data-number='+stage+']');
   			var dn1 = stage;
   			var m1 = $current.css('margin-left');
   			var mid = 0;

				$app.each(function(index, element){
					if($current.attr('id')!=element.id){
						var m2 = $(element).css('margin-left');
						var diff = parseInt(m2.split('p')[0]-m1.split('p')[0]);

						if(d == 'right'){
							if(diff > 0 && diff < 180) mid = element.id;
						} else if(d == 'left'){
							if(diff*-1 > 0 && diff*-1 < 180) mid = element.id;
						}
					}
				});
				var $next = $('#'+mid);
				var dn2 = $next.attr('data-number');

				$current.attr('data-number', dn2);
				$next.attr('data-number', dn1);
				stage = dn2;

				return $next;
   		};
	})( jQuery );
	(function( $ ){
   		$.fn.transition_opening = function(m) {

   			for(var i = 0; i < 6; i++){
					if(wave[i]!=null) wave[i].pause();
				}

    		TweenLite.to(this, trans_speed, {marginLeft: '-1445px', bottom:'-1445px', width:'2890px', height:'2890px', ease: Power4.easeOut});

				if(m == "optionmode"){
	    		var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
	    		$current.notSelected();
	    		var add = 1600;

	    		if($current.attr('data-type') == "main") {
	    			$('#rename, #remove').css('display', 'none');
	    			add = 1600;
	    		}
	    		else {
	    			$('#rename, #remove').css('display', 'inline-block');
	    			add = 2000;
	    		}
			 		TweenLite.to($('#option'), .001, {zIndex:2000, ease: Power4.easeInOut});


			 		var $opt = $('#option .optbutton');
			 		var time = 500;
					$opt.each(function(index, element){
						setTimeout( function(){
							console.log(element);
							TweenLite.to(element, .8, {opacity:1, y:'-=100', ease: Power4.easeInOut, delay:.4});
							console.log(time);
						}, time);
						time+=200;
					});

					//Set initial State
					setTimeout(function(){
						$('#rearrange').isSelected_option();
					}, add);
				}
				if(m == "addfolder"){
					TweenLite.to($('#addfolder'), .5, {opacity: 1, zIndex: 3000, delay: .5, onComplete: function(){
							$(".applist").first().isSelected();
							applistposition = 1;
					}});
				}
      	return this;
   		};
	})( jQuery );
	(function( $ ){
   		$.fn.transition_closing = function(m) {
				if(m == "optionmode" || m == "rearrange"){
   				TweenLite.to($('#option .optbutton'), .8, {opacity:0, y:'+=100', ease: Power4.easeInOut});
				}
				else if(m == "dummymode"){
					TweenLite.to($('#dummy'), .4, {opacity: 0, zIndex: -1, ease: Power4.easeIn});
				}
				else if(m == "addfolder"){
					TweenLite.to($('#addfolder'), .5, {opacity: 0});
				}

    		TweenLite.to(this, trans_speed-1, {marginLeft: '0', bottom:'0', width:'0px', height:'0px', ease: Power4.easeIn, onComplete: function(){
					if(m == "optionmode"){
						TweenLite.to($('#option'), .001, {zIndex:-1, ease: Power4.easeInOut});
						if(option_stage == 3) ;
						else {
							$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
							$('.selectedOption').notSelected_option();
						}
						mode = "navigation";
						option_stage = 1;
					}
					else if(m == "dummymode"){
						$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
						mode = "navigation";
					}
					else if(m == "rearrange"){
						mode = "rearrange";
						option_stage = 1;
					}
					else if(m =="addfolder"){
						$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
						mode = "navigation";
						level = 1;
						setting_stage = 1;
						applistposition = 1;
						folder_level = 1;
						$('#addfolder-done p').addClass('inactive');
					}
				}});
      	return this;
   		};
	})( jQuery );


	/**************** Keyboard Controls ****************/

	var option = false;
	var dummy = false;
	var movable = true;
	var navigating = false;

	// 1. Press Arrow Keys

	key('down', function(){
		console.log("down");

		for(var i = 0; i < 6; i++){
			if(wave[i]!=null) wave[i].pause();
		}
		if(flag){
			if(mode == "navigation"){
					// Apps
				var $getapp = $('.appbutton[data-number='+(parseInt(stage))+']');
				if(level == 1) {
					flag = false;
					$getapp.notSelected();
					$('#filter').isSelected_setting();
					level++;
				}
				// Settings
				else if(level == 0) {
					flag = false;
					$('.selected').notSelected_setting();
					$getapp.isSelected();
					level++;
					setting_stage = 1;
				}
			}
			else if(mode =="addfolder"){
				total_level = 1 + parseInt($('.applist').length/8);
				if(folder_level != total_level) {
					flag = false;
					folder_level++;
					$('.applist[data-number=\"folder-card'+applistposition+'\"]').isSelected();
					TweenLite.to($('#addfolder-done p'), .3, {paddingTop: '20px'});
					TweenLite.to($('#addfolder-done'), .3, {scale: 1, border: '0px #5eabd9 solid', onComplete: function(){
						flag = true;
					}});
				}
			}
		}
	});

	key('up', function(){
		console.log("up");

		for(var i = 0; i < 6; i++){
			if(wave[i]!=null) wave[i].pause();
		}
		if(flag)
			if(mode == "navigation"){
				// Apps
				var $getapp = $('.appbutton[data-number='+(parseInt(stage))+']');
				if(level == 1) {
					flag = false;
					$getapp.notSelected();
					$('#search').isSelected_setting();
					level--;
				}
				// Filter
				else if(level == 2) {
					flag = false;
					$('#filter').notSelected_setting();
					$getapp.isSelected();
					level--;
				}
			}
			else if(mode =="addfolder"){
				total_level = 1 + $('.applist').length/8;
				if(folder_level != 0) {
					flag = false;
					folder_level--;
					$('.selected').notSelected();
					//todo: highlight "done"
					TweenLite.to($('#addfolder-done p'), .3, {paddingTop: '14px'});
					TweenLite.to($('#addfolder-done'), .3, {scale: 1.1, border: '6px #5eabd9 solid', onComplete: function(){
						flag = true;
					}});
				}
			}
	});

	key('right', function(){
		console.log("right");
		for(var i = 0; i < 6; i++){
			if(wave[i]!=null) wave[i].pause();
		}
		if(flag){
			if(mode == "rearrange"){
				if(currentposition != count) {
					flag = false;
					var $current = $('.selected');
					var $next = $current.findNext('right');

					var m1 = $current.css('margin-left');
					var m2 = $next.css('margin-left');

					TweenLite.to($current, .2, {marginLeft: m2, ease: Power4.easeInOut, onComplete: function(){flag = true}});
					TweenLite.to($next, .2, {marginLeft: m1, ease: Power4.easeInOut, onComplete: function(){flag = true}});

					currentposition++;
					TweenLite.to($('.next, .prev'), .2, {x:'+=160px', ease: Power4.easeInOut});
				}
				if(currentposition == count){
					$('.next').css('display', 'none');
				}
				else if(currentposition == 1) {
					$('.prev').css('display', 'none');
				}
				else {
					$('.next').css('display', 'block');
					$('.prev').css('display', 'block');
				}
			}
			else if(mode == "navigation") {
				// Apps
				if(level == 1) {
					if(stage != count) {
						flag = false;
						stage++;
						position++;
					}
					//Move Apps
					if(position >= 5){
						flag = false;
						TweenLite.to($('.appbutton'),slide_speed,{left: '-=350', ease: Power1.easeInOut, onComplete: function(){
							//flag = true;
						}});
						position = 4;
						position_move += 1;
					}
					$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
					$('.appbutton[data-number='+(parseInt(stage-1))+']').notSelected();
				}
				// Settings
				else if(level == 0){
					if(setting_stage < 3) {
						flag = false;
						$(setting[setting_stage-1]).notSelected_setting();
						$(setting[setting_stage]).isSelected_setting();
						setting_stage++;
					}
				}
			}
			else if(mode == "optionmode") {
				var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
				if(option_stage <3 && $current.attr('data-type') != "main") {
					flag = false;
					$(optionlist[option_stage-1]).notSelected_option();
					$(optionlist[option_stage]).isSelected_option();
					option_stage++;
				}
			}
			else if(mode == "delete"){
				if(delete_stage <2) {
					flag = false;
					$(deletelist[delete_stage-1]).notSelected_option();
					TweenLite.to($(deletelist[delete_stage]), .4, {scale:1.3, ease: Power4.easeInOut, perspective: 1000, onComplete: function(){
						flag = true;
					}});
					delete_stage++;
				}
			}
			else if(mode == "addfolder" && folder_level == 1){
				if(applistposition != $('.applist').length) {
					applistposition++;
					$('.applist[data-number=\"folder-card'+(applistposition-1)+'\"]').notSelected();
					$('.applist[data-number=\"folder-card'+applistposition+'\"]').isSelected();
					console.log(applistposition);
				}
			}
		}
	});

	key('left', function(){
		console.log("left");
		for(var i = 0; i < 6; i++){
			if(wave[i]!=null) wave[i].pause();
		}
		if(flag){
			if(mode == "rearrange"){
				if(currentposition != 1) {
					flag = false;
					var $current = $('.selected');
					var $next = $current.findNext('left');

					var m1 = $current.css('margin-left');
					var m2 = $next.css('margin-left');

					TweenLite.to($current, .2, {marginLeft: m2, ease: Power4.easeInOut, onComplete: function(){flag = true}});
					TweenLite.to($next, .2, {marginLeft: m1, ease: Power4.easeInOut, onComplete: function(){flag = true}});

					currentposition--;
					TweenLite.to($('.next, .prev'), .2, {x:'-=160px', ease: Power4.easeInOut});
				}
				if(currentposition == count) {
					$('.next').css('display', 'none');
				}
				else if(currentposition == 1) {
					$('.prev').css('display', 'none');
				}
				else {
					$('.next').css('display', 'block');
					$('.prev').css('display', 'block');
				}
			}
			else if(mode == "navigation"){
				// Apps
				if(level == 1) {
					if(stage != 1) {
						flag = false;
						stage--;
						position--;
					}
					//Move Apps
					if(position < 0){
						flag = false;
						TweenLite.to($('.appbutton'),slide_speed,{left: '+=350', ease: Power1.easeInOut, onComplete: function(){
							//flag = true;
						}});
						position = 0;
						position_move-=1;
					}
					$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
					$('.appbutton[data-number='+(parseInt(stage+1))+']').notSelected();
				}
				// Settings
				else if(level == 0){
					if(setting_stage > 1) {
						flag = false;
						$(setting[setting_stage-1]).notSelected_setting();
						$(setting[setting_stage-2]).isSelected_setting();
						setting_stage--;
					}
				}
			}
			else if(mode == "optionmode") {
				var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
				if(option_stage >1 && $current.attr('data-type') != "main") {
					flag = false;
					$(optionlist[option_stage-1]).notSelected_option();
					$(optionlist[option_stage-2]).isSelected_option();
					option_stage--;
				}
			}
			else if(mode == "delete"){
				if(delete_stage >1) {
					flag = false;
					TweenLite.to($(deletelist[delete_stage-1]), .4, {scale:1, ease: Power4.easeInOut, perspective: 1000});
					$(deletelist[delete_stage-2]).isSelected_option();
					delete_stage--;
				}
			}
			else if(mode == "addfolder" && folder_level == 1){
				if(applistposition > 1) {
					applistposition--;
					$('.applist[data-number=\"folder-card'+(applistposition+1)+'\"]').notSelected();
					$('.applist[data-number=\"folder-card'+applistposition+'\"]').isSelected();
					console.log(applistposition);
				}
			}
		}
	});

	key('a', function(){
		console.log(position+"-"+stage+'='+position_move);
	});

	key('c', function(){
		console.log(flag+'-mode='+mode+'-count='+count+'-stage='+stage);
	});

	$(window).keydown(function (e){
			if(flag){
	    	if (e.altKey && level == 1 && mode == "navigation") {
					mode = "optionmode"
	    		option_stage = 1;

					// Reset Initial state
					$('#option .optbutton').notSelected_option(.001);
					TweenLite.to($('.transition'), .001, {backgroundColor: '#000'});

					flag = false;
					$('.transition').transition_opening("optionmode");
	    	}
			}
	});

	// // 2. Click for options
	// $('#app').on('click',".selected", function(){
	// 	option_stage = 1;
	//
	// 	// Reset Initial state
	// 	$('#option .optbutton').notSelected_option(.001);
	// 	TweenLite.to($('.transition'), .001, {backgroundColor: '#000'});
	//
	// 	if(!option && !checktransition && starttv){
	// 		$('.transition').transition_opening();
	// 	}
	// });

	// 3. Press ESC key
	key('esc', function(){
		if(flag) {
			if(mode == "optionmode" || mode == "dummymode" || mode == "addfolder") {
				flag = false;
				$('.transition').transition_closing(mode);
			}
		}
	});

var timeout = 400;

	// 4. Press Enter key
	key('enter', function(){
		if(flag){
			if(mode == "navigation") {
				flag = false;
				if(level == 1){
					var $currentID = ($('.appbutton[data-number='+stage+']').attr('id'));
					TweenLite.to($('.transition'), .01, {backgroundColor: colors[$currentID]});
					TweenLite.to($('#dummy'), .01, {backgroundColor: colors[$currentID]});

					TweenLite.to($('.appbutton[data-number='+(parseInt(stage))+']'), scale_speed/2, {scale:1.3, ease: Power1.easeInOut});
					TweenLite.to($('.appbutton[data-number='+(parseInt(stage))+']'), scale_speed, {scale:1.6, ease: Power1.easeInOut, delay: .08});

					TweenLite.to($('.transition'), trans_speed, {opacity: 1, marginLeft: '-1445px', bottom:'-1445px', width:'2890px', height:'2890px', ease: Power4.easeOut, delay:.3});
					TweenLite.to($('.appbutton[data-number='+(parseInt(stage))+']'), scale_speed, {scale:1, zIndex: 1, border: '0px #989898 solid', ease: Power1.easeIn, delay: 1.5});
					$('#dummy p').text($('.appbutton[data-number='+(parseInt(stage))+']').attr('data-content'));
					TweenLite.to($('#dummy'), 1, {opacity: 1, zIndex: 100, ease: Power4.easeIn, delay: .2, onComplete: function(){
						flag = true;
						mode = "dummymode";
					}});
				}
				if(level == 0){
					//search - nothing
					if(setting_stage==1){
						console.log("search");
						$("#search").addClass('pressed');
						TweenLite.to($('#search'), .2, {backgroundColor: pressed, scale: 1});
						setTimeout(function(){
							$("#search").removeClass('pressed');
							TweenLite.to($('#search'), .2, {backgroundColor: '#FFF', scale: 1.1, onComplete: function(){
								flag = true;
							}});
						},timeout);
					}
					//setting - nothing
					if(setting_stage==2){
						console.log("setting");
						$("#setting").addClass('pressed');
						TweenLite.to($('#setting'), .2, {backgroundColor: pressed, scale: 1});
						setTimeout(function(){
							$("#setting").removeClass('pressed');
							TweenLite.to($('#setting'), .2, {backgroundColor: '#FFF', scale: 1.1, onComplete: function(){
								flag = true;
							}});
						},timeout);
					}
					//folder!!!!!!!!!!!!!!!!!!
					if(setting_stage==3){
						console.log("add folder");

						$("#folder").addClass('pressed');
						TweenLite.to($('#folder'), .2, {backgroundColor: pressed, scale: 1});

						mode = "addfolder";

						var totalcard = $('#app .appbutton[data-type=\"card\"]').length;
						$('#addfolder-number--total').text(totalcard);
						$('#addfolder .appbutton[data-type=\"card\"]').remove();

						$('#app .appbutton[data-type=\"card\"]').clone().appendTo($('#addfolder'));
						$('#addfolder .appbutton').addClass('applist');
						$('.applist').each(function(index, element){
							var data = $(this).attr('data-number')
							$(this).attr('data-number', "folder-card"+(index+1));
							$(this).css('margin','240px '+parseInt(100+index*170)+'px');
						});

						TweenLite.to($('.transition'), .001, {backgroundColor:'#000'});
						setTimeout(function(){
							$('.transition').transition_opening('addfolder');
						}, 200);

						setTimeout(function(){
							$("#folder").removeClass('pressed');
							$("#folder").notSelected_setting();
						},300);
					}
				}
				else if(level == 2){
					console.log("filter");
					$("#filter").addClass('pressed');
					TweenLite.to($('#filter'), .2, {backgroundColor: pressed, scale: 1});
					setTimeout(function(){
						$("#filter").removeClass('pressed');
						TweenLite.to($('#filter'), .2, {backgroundColor: '#FFF', scale: 1.1, onComplete: function(){
							flag = true;
						}});
					},timeout);
				}
			}
			else if(mode == "optionmode"){
				flag = false;
				//rearrange!!!!!!!!!!!!!!!!!!
				if(option_stage==1){

					for(var i = 0; i < 6; i++){
						if(wave[i]!=null) wave[i].pause();
					}

					console.log("rearrange");

					if(stage == count) $('.next').css('display', 'none');
					else if(stage == 1) $('.prev').css('display', 'none');
					else {
						$('.next').css('display', 'block');
						$('.prev').css('display', 'block');
					}

					currentposition = stage;
					$("#rearrange").addClass('pressed');
					TweenLite.to($('#rearrange'), .2, {backgroundColor: pressed, scale: 1});

					//Actions
					$('.transition').transition_closing("rearrange");

					TweenLite.to($('#black'), .5, {opacity:.4, zIndex:2000, ease: Power1.easeInOut, delay: .5});

					var $app = $('.appbutton');
					TweenLite.to($app, .8, {scale:.5, ease: Power4.easeInOut, delay: .5});

					if(position_move>0){
						TweenLite.to($('.appbutton'),slide_speed,{left: '+='+(350*position_move), ease: Power1.easeInOut, delay: .5});
					}

					setTimeout(function(){
						if(count <= 10) {
							for ( var i = 0; i < count; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-150*count-(count-1)*10)/2+i*(150+10)-150/2, ease: Power4.easeInOut});
							}
						} else {
							for ( var i = 0; i < count; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-150*10-90)/2+i*(150+90/5), ease: Power4.easeInOut});
							}
						};
						setTimeout(function(){
							var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
							$current.isSelected(.9);

							//Animation
							for(var i = 0; i < 3; i++){
								tl1[i] = new TimelineMax({repeat:-1, delay: .1*i});
								tl2[i] = new TimelineMax({repeat:-1, delay: .1*i});
							}

							var $next = $('.next');
							var animatespeed = .6;

							//Next & Prev
							$next.each(function(index, element){
								tl1[index].fromTo(element, animatespeed, {left: (arrow_next+(150+10)*(stage-1)+16*index)+'px', opacity:0, ease: Power2.easeIn}, {left: (arrow_next+5+(150+10)*(stage-1)+16*index)+'px', opacity:1, ease: Power2.easeIn}).to(element, animatespeed, {left: (arrow_next+10+(150+10)*(stage-1)+16*index)+'px', opacity:0, ease: Power2.easeOut});
							});

							var $prev = $('.prev');
							$prev.each(function(index, element){
								tl2[index].fromTo(element, animatespeed, {left: (arrow_prev+(150+10)*(stage-1)-16*index)+'px', opacity:0, ease: Power2.easeIn}, {left: (arrow_prev-5+(150+10)*(stage-1)-16*index)+'px', opacity:1, ease: Power2.easeIn}).to(element, animatespeed, {left: (arrow_prev-10+(150+10)*(stage-1)-16*index)+'px', opacity:0, ease: Power2.easeOut});
							});

							TweenLite.to($('.appbutton[data-number='+(parseInt(stage))+']'), .001, {zIndex:3000});

							$("#rearrange").removeClass('pressed');
							TweenLite.to($('#rearrange'), .2, {backgroundColor: '#FFF'});

						}, 700);
					}, 500);
				}
				//rename - nothing
				else if(option_stage==2){
					console.log("rename");
					$("#rename").addClass('pressed');
					TweenLite.to($('#rename'), .2, {backgroundColor: pressed, scale: 1});
					setTimeout(function(){
						$("#rename").removeClass('pressed');
						TweenLite.to($('#rename'), .2, {backgroundColor: '#FFF', scale: 1.3, onComplete: function(){
							flag = true;
						}});
					},timeout);
				}
				//remove!!!!!!!!!!!!!!!!!!
				else if(option_stage==3){
					console.log("remove");
					$("#remove").addClass('pressed');
					TweenLite.to($('#remove'), .2, {backgroundColor: pressed, scale: 1});

					setTimeout(function(){
						var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
						if($current.attr('data-type') == "folder") {
							mode = "delete";
							console.log("Folder");
							TweenLite.to($('#option .optbutton'), .8, {opacity:0, y:'+=100', ease: Power4.easeInOut, onComplete: function(){
								TweenLite.to($('#option'), .001, {zIndex:-1, ease: Power4.easeInOut});
								TweenLite.to($('#delete .message'), .4, {opacity:1, ease: Power4.easeInOut});
								TweenLite.to($('#delete'), .001, {zIndex:2000, ease: Power4.easeInOut});

								var $opt = $('#delete .optbutton');
						 		var time = 0;
								$opt.each(function(index, element){
									setTimeout( function(){
										TweenLite.to(element, .8, {opacity:1, y:'-=100', ease: Power4.easeInOut});
									}, time);
									time+=200;
								});

								setTimeout(function(){
									$('#cancel').isSelected_option();
									setTimeout(function(){
										$("#remove").removeClass('pressed');
									}, 400);
								}, 1000);
							}});
						}
						else {
							$('.transition').transition_closing("optionmode");
							var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
							TweenLite.to($current, .4, {y:'+=200', opacity: 0, ease: Power2.easeInOut, delay: 1, onComplete:function(){

								for(var i = parseInt(stage)+1; i <= count; i++){
									var $follow = $('.appbutton[data-number='+(parseInt(i))+']');
									$follow.attr('data-number', i-1);
									console.log($follow);
									if(count <= 5) {
										if(stage == 1){
											TweenLite.to($follow, .4, {marginLeft: '-=162px', ease: Power4.easeInOut});
											//TweenLite.to($('.next, .prev'), .4, {left:'-=162px', ease: Power4.easeInOut});

										} else {
											TweenLite.to($follow, .4, {marginLeft: '-=478px', ease: Power4.easeInOut});
											//TweenLite.to($('.next, .prev'), .4, {left:'-=478px', ease: Power4.easeInOut});
										}
									}
									else {
										TweenLite.to($follow, .4, {marginLeft: '-=320px', ease: Power4.easeInOut, delay: .2});
										//TweenLite.to($('.next, .prev'), .4, {left:'-=320px', ease: Power4.easeInOut});
									}
								}

								setTimeout(function(){
									if(stage != 1) {
										$('.appbutton[data-number='+(parseInt(stage-1))+']').isSelected();
										stage = stage - 1;
										if(position_move == 0) {
											position--;
											if(count <= 5) {
												TweenLite.to($('.appbutton'),slide_speed,{marginLeft: '+='+158, ease: Power1.easeInOut});
											}
										}
										else if(position_move == count-5){
											position_move--;
											TweenLite.to($('.appbutton'),slide_speed,{left: '+='+350, ease: Power1.easeInOut});
										}
										else{
											if(position != 0) position--;
											else {
												position_move--;
												TweenLite.to($('.appbutton'),slide_speed,{left: '+='+350, ease: Power1.easeInOut});
											}
										}
									}
									else {
										$('.appbutton[data-number='+parseInt(stage)+']').isSelected();
									}
									$current.remove();
									count-=1;
									arrow_next = 515 + (8-count)*0.5*(150+10);
									arrow_prev = 235 + (8-count)*0.5*(150+10);

								}, 200);
							}});

						}
					},0);
				}
			}
			else if(mode == "rearrange"){
				$('.appbutton[data-number='+(parseInt(stage))+']').notSelected(.5);
				var $current = $('.appbutton[data-number='+(parseInt(stage))+']');

				TweenLite.to($('.next, .prev'), .001, {opacity:0, x: 0});
				for(var i = 0; i < 3; i++){
					tl1[i].kill();
					tl2[i].kill();
				}

				TweenLite.to($('#black'), .5, {opacity:0, zIndex:-1, ease: Power1.easeInOut, delay: .3});

				var $app = $('.appbutton');
				TweenLite.to($app, .8, {scale:1, ease: Power4.easeInOut, delay: .3});

				setTimeout(function(){
					if(count <= 5) {
						for ( var i = 0; i < count; i++ ) {
							TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-300*count)/2+i*(300+100/count), ease: Power4.easeInOut});
						}
					} else {
						for ( var i = 0; i < count; i++ ) {
							TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-300*5-100)/2+i*(300+100/5), ease: Power4.easeInOut});
						}
					};

					if(position > 4) position = 4;
					else position = stage-1;

					if(stage > 5){
						TweenLite.to($('.appbutton'),slide_speed,{left: '-='+(350*(stage-5)), ease: Power1.easeInOut, delay: .5});
						position = 4;
						position_move = stage - 5;
					}
					else position_move = 0;

					setTimeout(function(){
						mode = "navigation";
						$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
					}, 700);
				}, 300);
			}
			else if(mode == "delete"){
				console.log("remove");

				if(delete_stage == 1) {
					$("#cancel").addClass('pressed');
					TweenLite.to($('#cancel'), .2, {backgroundColor: pressed, scale: 1});
				} else{
					TweenLite.to($('#confirm'), .2, {scale: 1});
				}
				setTimeout(function(){
					TweenLite.to($('#delete .message'), .8, {opacity:0, ease: Power4.easeInOut});
					TweenLite.to($('#delete .optbutton'), .8, {opacity:0, y:'+=100', ease: Power4.easeInOut, onComplete: function(){
						option_stage = 1;

						if(delete_stage == 1){
							setTimeout(function(){
								$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
								setTimeout(function(){
									mode = "navigation";
									$("#cancel").removeClass('pressed');
								}, scale_speed*1000);
							}, 600);
						}
						else {
							console.log("confirm");
							setTimeout(function(){
								var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
								TweenLite.to($current, .4, {y:'+=200', opacity: 0, ease: Power2.easeInOut, onComplete:function(){

									for(var i = parseInt(stage)+1; i <= count; i++){
										var $follow = $('.appbutton[data-number='+(parseInt(i))+']');
										$follow.attr('data-number', i-1);
										console.log($follow);
										if(count <= 5) {
											if(stage == 1){
												TweenLite.to($follow, .4, {marginLeft: '-=162px', ease: Power4.easeInOut});
												//TweenLite.to($('.next, .prev'), .4, {left:'-=162px', ease: Power4.easeInOut});

											} else {
												TweenLite.to($follow, .4, {marginLeft: '-=478px', ease: Power4.easeInOut});
												//TweenLite.to($('.next, .prev'), .4, {left:'-=478px', ease: Power4.easeInOut});
											}
										}
										else {
											TweenLite.to($follow, .4, {marginLeft: '-=320px', ease: Power4.easeInOut, delay: .2});
											//TweenLite.to($('.next, .prev'), .4, {left:'-=320px', ease: Power4.easeInOut});
										}

									}

									setTimeout(function(){
										if(stage != 1) {
											$('.appbutton[data-number='+(parseInt(stage-1))+']').isSelected();
											stage = stage - 1;
											if(position_move == 0) {
												position--;
												if(count <= 5) {
													TweenLite.to($('.appbutton'),slide_speed,{marginLeft: '+='+158, ease: Power1.easeInOut});
												}
											}
											else if(position_move == count-5){
												position_move--;
												TweenLite.to($('.appbutton'),slide_speed,{left: '+='+350, ease: Power1.easeInOut});
											}
											else{
												if(position != 0) position--;
												else {
													position_move--;
													TweenLite.to($('.appbutton'),slide_speed,{left: '+='+350, ease: Power1.easeInOut});
												}
											}
										}
										else {
											$('.appbutton[data-number='+parseInt(stage)+']').isSelected();
										}
										$current.remove();
										count-=1;
										mode = "navigation";

										arrow_next = 515 + (8-count)*0.5*(150+10);
										arrow_prev = 235 + (8-count)*0.5*(150+10);
										delete_stage = 1;
									}, 200);
								}});
							}, 200);
						}
						$('.selectedOption').notSelected_option();

					}});
					TweenLite.to($('.transition'), trans_speed-1, {marginLeft: '0', bottom:'0', width:'0px', height:'0px', ease: Power4.easeIn, delay: .2, onComplete: function(){
						TweenLite.to($('#delete'), .001, {zIndex:-1, ease: Power4.easeInOut});
					}});
				}, 0);
			}
			else if(mode == "addfolder") {
				if(folder_level == 0){
					if ($('#addfolder-done p').hasClass('inactive')) console.log("inactive");
					else {
						flag = false;
						var offset = 0;

						console.log("done");
						TweenLite.to($('#addfolder-done p'), .3, {paddingTop: '20px'});
						$('#addfolder-done p').addClass('pressed');
						TweenLite.to($('#addfolder-done'), .3, {scale: 1, background: '#5eabd9', border: '0px #5eabd9 solid', onComplete: function(){
							TweenLite.to($('.transition'), trans_speed, {marginLeft: '0px', bottom:'0px', width:'0px', height:'0px', ease: Power4.easeOut, delay: .3});

							//Step 1
							var folder_card = [];
							$('.appselected').each(function(index, element){
								var id = $(this).attr('id');
								folder_card[index] = $('#app > .appbutton#'+id).clone();
								folder_card[index].removeClass('appbutton').addClass('appbutton-folder');
								folder_card[index].attr('data-type', 'folder-card');
								if($('#app > .appbutton#'+id).attr('data-number') <= stage) offset++;
								console.log("offset="+offset);
								$('#app > .appbutton#'+id).remove();
								count--;
								console.log(folder_card[index]);
							});

							$('#app > .appbutton').each(function(index, element){
								$(this).attr('data-number', parseInt(index)+1);
								for ( var i = 0; i < count; i++ ) {
									var $getapp = $('.appbutton[data-number='+(i+1)+']');
									$getapp.css('margin-left',(1920-300*5)/2+i*(300+100/5)-40);
								}
							});

							TweenLite.to($('#addfolder'), .5, {opacity: 0, zIndex: -1, onComplete: function(){


								//Step 2

								var $current = $('.appbutton[data-number='+stage+']');
								for(var i = count; i >= parseInt(stage)+1; i--){
									var $follow = $('.appbutton[data-number='+(parseInt(i))+']');
									//console.log(i);
									$follow.attr('data-number', parseInt(i)+1);
									//console.log($follow);
									TweenLite.to($follow, .4, {marginLeft: '+=320px', ease: Power4.easeInOut, delay: .2});
								}
								stage++;
								count++;
								total++;
								position++;

								arrow_next = 515 + (8-count)*0.5*(150+10);
								arrow_prev = 235 + (8-count)*0.5*(150+10);

								if(position >= 5){
									TweenLite.to($('.appbutton'),slide_speed,{left: '-=350', ease: Power1.easeInOut, onComplete: function(){
										//flag = true;
									}});
									position = 4;
									position_move += 1;
								}
								var folder_amount = $('.appbutton[data-type="folder"]').length;
								folder_amount++;
								$current.after('<div class="appbutton" id="app'+pad(total,2)+'" data-type="folder" data-number="'+stage+'" data-content="Folder'+folder_amount+'"><p>Folder'+folder_amount+'</p>');
								var $current = $('.appbutton[data-number='+stage+']');

								for(var i = 0; i < folder_card.length; i++){
									folder_card[i].attr('data-number', stage+'-'+(parseInt(i)+1));
									folder_card[i].css('margin-left', 120+70*i);
									$current.append(folder_card[i]);

								}

								$current.css('background-color', '#5a5a5a');
								$current.css('margin-left', (1920-300*5)/2+(stage-1)*(300+100/5)-40 - position_move*350);
								$current.css('z-index', 100);
								$current.append('<span class="icon_folder"></span>');

								$current.isSelected();
								setTimeout(function(){
									TweenLite.fromTo($current, .4, {scale: 0,opacity: 0}, {scale: 1.6, opacity: 1, y: '-=100'});
								}, 500);

								mode = "navigation";
								level = 1;
								setting_stage = 1;
								applistposition = 1;
								appselected = 0;
								//stage -= offset;

								$('#addfolder-number--selected').text(appselected);
								TweenLite.to($('#addfolder-done'), .01, {background: '#FFF'});
								$('#addfolder-done p').removeClass('pressed');
								$('#addfolder-done p').addClass('inactive');
								folder_level = 1;
								flag = true;
							}});
						}});
					}
				}
				else if(folder_level == 1){
					console.log("check app number "+applistposition);
					$('.applist').each(function(index,element){
						if(index == applistposition-1) {
							if($(this).hasClass('appselected')){
								TweenLite.to($(this), .1, {backgroundColor: '#ccc'});
								$(this).removeClass('appselected');
								appselected--;
							}
							else {
								TweenLite.to($(this), .1, {backgroundColor: '#5eabd9'});
								$(this).addClass('appselected');
								appselected++;
							}
						}
					});
					$('#addfolder-number--selected').text(appselected);

					if(appselected != 0) $('#addfolder-done p').removeClass('inactive');
					else $('#addfolder-done p').addClass('inactive');
				}
			}
		}
	});

});

function pad (str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}
