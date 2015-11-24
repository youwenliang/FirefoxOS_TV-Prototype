
/**************** Parameters ****************/

var mode = "navigation";
var position = 0;
var position_move = 0;

//navigation mode
var stage = 1;
var level = 1;

//addfolder mode
var folder_level = 1;
var total_level = 2;
var applistposition = 1;
var appselected = 0;
var apptotal = 0;
var addfolder_stage = 2;

var $backup;
var filter_mode = "all";
var filtering = false;
var waveReset = [true,true,true,true];
var waveReseting = true;

//rearrange mode
var currentposition = 0;
var filter_stage = 1;

var rearrangelevel = 1;
var rearrange_stage = 1;
var rearrange_nav_stage = 1;

//delete mode
var deletelist = ["#cancel", "#confirm"];
var delete_stage = 1;

var colors = {"app01": "#d90070", "app02": "#00cbb0", "app03": "#0071d7", "app04":"#56575c", "app05":"#ED0E86", "app06":"#ED0E86", "app07":"#4A82EA", "app08":"#8D1C9B", "app09":"#01C7F1"};
var pressed = "#5eabd9";

var setting = ["#search", "#setting", "#folder"];
var setting_stage = 1;

var optionlist = ["#rearrange", "#rename", "#remove"];
var option_stage = 1;

//All checking flag
var flag = false;

// Speeds
var scale_speed = .3;
var slide_speed = .3;
var trans_speed = 1.8;
var speed3 = .4;
var filter_duration = 300;

var count = $('#app > .appbutton').length;
var total = count;

var arrow_next = 524 + (8-count)*0.5*(150+10);
var arrow_prev = 239 + (8-count)*0.5*(150+10);

var isSelected_cardsize = '300px';
var notSelected_cardsize = '120px';
var origin_cardsize = '300px';
var cardoffset = 92;
var cardoffset1 = 30;

// Animation Loops
var tl1 = new TimelineMax({repeat:-1});
var tl2 = new TimelineMax({repeat:-1});
var wave = new TimelineMax({repeat:-1});

$(document).ready(function(){
	
	//Initial Settings
	initSmartHome();

	$(window).keydown(function (e){
    	if (e.altKey) {
    		if(flag) {
				if (level == 1 && mode == "navigation" && !filtering) {
					mode = "optionmode"
	    			option_stage = 1;

					// Reset Initial state
					$('#option .optbutton').notSelected_option(.001);
					TweenLite.to($('.transition'), .001, {backgroundColor: '#000'});

					flag = false;
					$('.transition').transition_opening("optionmode");
					var $current = $('.appbutton[data-number='+stage+']');
	   				if($current.attr('data-type') == "folder"){
	   					TweenLite.to($('#'+$current.attr('id')+' > .appbutton-folder'), speed3, {opacity:0});
	   				}

		    	}
			}
    	}
    	if (e.keyCode == 65) {
    		console.log("stage="+stage+" currentposition="+currentposition+" rearrangestage="+rearrange_stage);
    		console.log(waveReset);
    	}
	});

	document.onkeydown = checkKey;
	function checkKey(e){
		e = e || window.event;
		var timeout = 400;

		/********************************************************************************************************************************

		KEY EVENTS - OPTION

		********************************************************************************************************************************/

		if(typeof KeyEvent != "undefined"){
			if(e.keyCode == KeyEvent.DOM_VK_SUBMENU) {
				if(flag) {
					if (level == 1 && mode == "navigation" && !filtering) {
						mode = "optionmode"
		    			option_stage = 1;

						// Reset Initial state
						$('#option .optbutton').notSelected_option(.001);
						TweenLite.to($('.transition'), .001, {backgroundColor: '#000'});

						flag = false;
						$('.transition').transition_opening("optionmode");
						var $current = $('.appbutton[data-number='+stage+']');
		   				if($current.attr('data-type') == "folder"){
		   					TweenLite.to($('#'+$current.attr('id')+' > .appbutton-folder'), speed3, {opacity:0});
		   				}

			    	}
				}
			}
		}
		

		/********************************************************************************************************************************

		KEY EVENTS - ENTER

		********************************************************************************************************************************/

		if(e.keyCode == 13) {
			if(flag){
				if(mode == "navigation") {
					flag = false;
					if(level == 1){
						if($('.appbutton[data-number='+(parseInt(stage))+']').attr('data-type') != "folder"){
							var $currentID = ($('.appbutton[data-number='+stage+']').attr('id'));
							TweenLite.to($('.transition'), .01, {backgroundColor: colors[$currentID]});
							TweenLite.to($('#dummy'), .01, {backgroundColor: colors[$currentID]});

							TweenLite.to($('.appbutton[data-number='+(parseInt(stage))+']'), scale_speed/2, {scaleX:1.3, scaleY:1.3, scaleZ:1.3, z: 0.001, perspective: 1000, force3D: true,   ease: Power1.easeInOut});
							TweenLite.to($('.appbutton[data-number='+(parseInt(stage))+']'), scale_speed, {scaleX:1.6, scaleY:1.6, scaleZ:1.6, z: 0.001, perspective: 1000, force3D: true,   ease: Power1.easeInOut, delay: .08});

							//TweenLite.to($('.transition'), trans_speed, {opacity: 1, perspective: 1000, force3D: true,   ease: Power4.easeOut, delay:.3});
							$('.dummycontent').css('background-image', 'url(\'../images/'+$('.appbutton[data-number='+(parseInt(stage))+']').attr('data-content')+'-dummy.jpg\')');
							$('#dummy p').text('');

	  						if($('.appbutton[data-number='+(parseInt(stage))+']').attr('data-content')=="Browser") circle_transition("#000", true);
							else circle_transition($('.appbutton[data-number='+(parseInt(stage))+']').css('background-color'), true);
							TweenLite.to($('.appbutton[data-number='+(parseInt(stage))+']'), scale_speed, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   zIndex: 1, border: '0px #989898 solid', ease: Power1.easeIn, delay: 1.5});
							
							//if($('.appbutton[data-number='+(parseInt(stage))+']').attr('data-type') == "main"){
								
							// }
							// else {
							// 	$('.dummycontent').css('background', 'rgba(0,0,0,0)');
							// 	$('#dummy p').text($('.appbutton[data-number='+(parseInt(stage))+']').attr('data-content'));
							// }

							TweenLite.to($('#dummy'), 1, {opacity: 1, zIndex: 100, ease: Power4.easeIn, delay: 0, onComplete: function(){
								flag = true;
								mode = "dummymode";
								playWave(false);
							}});
						}
						else flag = true;
					}
					else if(level == 3){
						flag = true;
					}
					if(level == 0){
						//search - nothing
						if(setting_stage==1){
							console.log("search");
							$("#search").addClass('pressed');
							TweenLite.to($('#search'), .2, {backgroundColor: pressed, scaleX:1, scaleY:1, scaleZ:1, z: 0.001,});
							TweenMax.delayedCall( timeout/1000, function(){
								$("#search").removeClass('pressed');
								TweenLite.to($('#search'), .2, {backgroundColor: '#FFF', scaleX:1.1, scaleY:1.1, scaleZ:1.1, z: 0.001, onComplete: function(){
									flag = true;
								}});
							});
						}
						//setting - nothing
						if(setting_stage==2){
							console.log("setting");
							$("#setting").addClass('pressed');
							TweenLite.to($('#setting'), .2, {backgroundColor: pressed, scaleX:1, scaleY:1, scaleZ:1, z: 0.001});
							TweenMax.delayedCall(timeout/1000, function(){
								$("#setting").removeClass('pressed');
								TweenLite.to($('#setting'), .2, {backgroundColor: '#FFF', scaleX:1.1, scaleY:1.1, scaleZ:1.1, z: 0.001, onComplete: function(){
									flag = true;
								}});
							});
						}
						//folder!!!!!!!!!!!!!!!!!!
						if(setting_stage==3){
							console.log("add folder");

							$("#folder").addClass('pressed');
							TweenLite.to($('#folder'), .2, {backgroundColor: pressed, scaleX:1, scaleY:1, scaleZ:1, z: 0.001});

							mode = "addfolder";

							var totalcard = $('#app .appbutton[data-type=\"card\"]').length;
							$('#addfolder-number--total').text("/"+totalcard);
							$('#addfolder .appbutton[data-type=\"card\"]').remove();

							$('#app .appbutton[data-type=\"card\"]').clone().appendTo($('#addfolder'));
							$('#addfolder .appbutton').addClass('applist');
							$('.applist').each(function(index, element){
								var data = $(this).attr('data-number')
								$(this).attr('data-number', "folder-card"+(index+1));
								$(this).css({'width':'190px', 'height': '190px', 'margin':'240px '+parseInt(155+index*240)+'px'});
							});

							TweenLite.to($('.transition'), .001, {backgroundColor:'#000'});
							TweenMax.delayedCall(.2,function(){
								$('.transition').transition_opening('addfolder');
							});

							TweenMax.delayedCall( .3, function(){
								$("#folder").removeClass('pressed');
								$("#folder").notSelected_setting();
							});
						}
					}
					else if(level == 2){
						// console.log("filter");
						// $("#filter").addClass('pressed');
						// TweenLite.to($('#filter'), .2, {backgroundColor: pressed, scale: 1});
						// setTimeout(function(){
						// 	$("#filter").removeClass('pressed');
						// 	TweenLite.to($('#filter'), .2, {backgroundColor: '#FFF', scale: 1.1, onComplete: function(){
						// 		flag = true;
						// 	}});
						// },timeout);
						flag = false;

						$('.filter-section li').eq(filter_stage-1).animate({  textIndent: 8 }, {
						    step: function(now,fx) {
						      $(this).css('-webkit-transform','scale('+now/10+')');
							  $(this).css('transform','scale('+now/10+')');
							  $(this).css('-moz-transform','scale('+now/10+')');

						    },duration:100
						},'linear');
						$('.filter-section li').eq(filter_stage-1).animate({  textIndent: 12 }, {
						    step: function(now,fx) {
						      $(this).css('-webkit-transform','scale('+now/10+')');
							  $(this).css('transform','scale('+now/10+')');
							  $(this).css('-moz-transform','scale('+now/10+')');

						    },duration:200
						},'linear');

						var type = $('.filter-section li').eq(filter_stage-1).attr('data-filter');

						if(type != filter_mode){
							TweenLite.to($('#filter .filtericon01'), .5, {backgroundPosition: '50% 335%', ease: Power4.easeOut});
							$('#filter .filtericon02').css('background-image','url(../images/'+type+'.svg)');
							//$('#filter.navbutton.selected .filtericon02').css('background-image','url(../images/'+type+'-dark.svg) !important');
							$('.filtericon02').removeClass('important-'+filter_mode);
							//$('#filter.navbutton.selected .filtericon02').addClass('important-'+type);

							TweenLite.to($('#filter .filtericon02'), .5, {backgroundPosition: '50% 50%', ease: Power4.easeOut, onComplete: function(){
								$('#filter .filtericon02').css('background-position', '50% -235%');

								$('#filter .filtericon01').css('background-position', '50% 50%');
								$('#filter .filtericon01').css('background-image','url(../images/'+type+'.svg)');
								//$('#filter.navbutton.selected .filtericon01').css('background-image','url(../images/'+type+'-dark.svg) !important');
								$('.filtericon01').removeClass('important-'+filter_mode);
								//$('#filter.navbutton.selected .filtericon01').addClass('important-'+type);
							}});

						}

						waveReset = [true, true, true, true];

						TweenMax.delayedCall(.1, function(){
							$('.active').css('color', '#ccc');
							$('.active').removeClass('active');
							$('.filter-section li').eq(filter_stage-1).addClass('active');

							$('#app > .appbutton').closing();
							var timing;
							if(count == 1) timing = 700;
							else timing = 1000;


							TweenMax.delayedCall(timing/1000, function(){

								if(type == "all"){
									filtering = false;
									$('.next, .prev').css('display', 'block');
									if($('#app > .appbutton').length != $backup.length){
										$('#app > .appbutton').remove();
										$('#app').append($backup);
										count = $backup.length;
									}
									$('#app > .appbutton').opening();
									filter_mode = "all";
								}
								else{
									filtering = true;
									$('#app > .appbutton').remove();
									$('#app').append($backup);
									$('.next, .prev').css('display', 'none');
									filter_mode = type;

									var $filtered = $('#app > .appbutton[data-filter="'+type+'"]').clone();

									count = $filtered.length;

									$filtered.each(function(index, element){
										$(this).attr('data-number', parseInt(index)+1);
										$(this).css('margin-left',(1920-300*count)/2+index*(300+100/count)-40);
									});
									TweenMax.delayedCall(.2, function(){
										$('#app > .appbutton').remove();
										$('#app').append($filtered);
										$('#app > .appbutton').css('left', 0);
										$('#app > .appbutton').opening();
									});
								}
							});
						});
					}
				}
				else if(mode == "optionmode"){
					flag = false;
					//rearrange!!!!!!!!!!!!!!!!!!
					if(option_stage==1){

						playWave(false);

						console.log("rearrange");

						if(stage == count) $('.next').css('display', 'none');
						else if(stage == 1) $('.prev').css('display', 'none');
						else {
							$('.next').css('display', 'block');
							$('.prev').css('display', 'block');
						}

						currentposition = stage;
						$("#rearrange").addClass('pressed');
						TweenLite.to($('#rearrange'), .2, {backgroundColor: pressed, scaleX:1, scaleY:1, scaleZ:1, z: 0.001,});

						//Actions
						$('.transition').transition_closing("rearrange");

						TweenLite.to($('#black'), .5, {opacity:.4, zIndex:2000, ease: Power1.easeInOut, delay: .5});

						var $app = $('.appbutton');
						TweenLite.to($app, .8, {scaleX:.5, scaleY:.5, scaleZ:.5, z: 0.001, ease: Power4.easeInOut, perspective: 1000, force3D: true,   delay: .5});

						if(position_move>0){
							TweenLite.to($('.appbutton'),slide_speed,{left: '+='+(350*position_move), perspective: 1000, force3D: true,   ease: Power1.easeInOut, delay: .5});
						}

						TweenMax.delayedCall(.5, function(){
							if(count <= 10) {
								for ( var i = 0; i < count; i++ ) {
									TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-150*count-(count-1)*10)/2+i*(150+10)-150/2, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
								}
							} else {
								for ( var i = 0; i < count; i++ ) {
									TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-150*10-90)/2+i*(150+90/5), perspective: 1000, force3D: true,   ease: Power4.easeInOut});
								}
							};
							TweenMax.delayedCall(.7, function(){
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

							});
						});
					}
					//rename - nothing
					else if(option_stage==2){
						console.log("rename");
						$("#rename").addClass('pressed');
						TweenLite.to($('#rename'), .2, {backgroundColor: pressed, scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true, });
						TweenMax.delayedCall(timeout/1000,function(){
							$("#rename").removeClass('pressed');
							TweenLite.to($('#rename'), .2, {backgroundColor: '#FFF', scaleX:1.3, scaleY:1.3, scaleZ:1.3, z: 0.001, perspective: 1000, force3D: true,   onComplete: function(){
								flag = true;
							}});
						});
					}
					//remove!!!!!!!!!!!!!!!!!!
					else if(option_stage==3){
						console.log("remove");
						$("#remove").addClass('pressed');
						TweenLite.to($('#remove'), .2, {backgroundColor: pressed, scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true, });


							var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
							if($current.attr('data-type') == "folder") {
								mode = "delete";
								console.log("Folder");
								TweenLite.to($('#option .optbutton'), .8, {opacity:0, y:'+=100', z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut, onComplete: function(){
									TweenLite.to($('#option'), .001, {zIndex:-1, ease: Power4.easeInOut});
									TweenLite.to($('#delete .message'), .4, {opacity:1, ease: Power4.easeInOut});
									TweenLite.to($('#delete'), .001, {zIndex:2000, ease: Power4.easeInOut});

									var $opt = $('#delete .optbutton');
							 		var time = 0;
									$opt.each(function(index, element){
										TweenMax.delayedCall( time/1000, function(){
											TweenLite.to(element, .8, {opacity:1, y:'-=100', z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
										});
										time+=200;
									});

									TweenMax.delayedCall(1, function(){
										$('#cancel').isSelected_option();
										TweenMax.delayedCall(.4, function(){
											$("#remove").removeClass('pressed');
										});
									});
								}});
							}
							else {
								$('.transition').transition_closing("optionmode");
								var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
								TweenLite.to($current, .4, {y:'+=200', z: 0.001, opacity: 0, perspective: 1000, force3D: true,   ease: Power2.easeInOut, delay: 1, onComplete:function(){

									for(var i = parseInt(stage)+1; i <= count; i++){
										var $follow = $('.appbutton[data-number='+(parseInt(i))+']');
										$follow.attr('data-number', i-1);

										if(count <= 5) {
											if(stage == 1){
												TweenLite.to($follow, .4, {marginLeft: '-=162px', perspective: 1000, force3D: true,   ease: Power4.easeInOut});
												//TweenLite.to($('.next, .prev'), .4, {left:'-=162px', ease: Power4.easeInOut});

											} else {
												TweenLite.to($follow, .4, {marginLeft: '-=478px', perspective: 1000, force3D: true,   ease: Power4.easeInOut});
												//TweenLite.to($('.next, .prev'), .4, {left:'-=478px', ease: Power4.easeInOut});
											}
										}
										else {
											TweenLite.to($follow, .4, {marginLeft: '-=320px', perspective: 1000, force3D: true,   ease: Power4.easeInOut, delay: .2});
											//TweenLite.to($('.next, .prev'), .4, {left:'-=320px', ease: Power4.easeInOut});
										}
									}

									TweenMax.delayedCall(.2, function(){
										if(stage != 1) {
											$('.appbutton[data-number='+(parseInt(stage-1))+']').isSelected();
											stage = stage - 1;
											if(position_move == 0) {
												position--;
												if(count <= 5) {
													TweenLite.to($('.appbutton'),slide_speed,{marginLeft: '+='+158, perspective: 1000, force3D: true,   ease: Power1.easeInOut});
												}
											}
											else if(position_move == count-5){
												position_move--;
												TweenLite.to($('.appbutton'),slide_speed,{left: '+='+350, perspective: 1000, force3D: true,   ease: Power1.easeInOut});
											}
											else{
												if(position != 0) position--;
												else {
													position_move--;
													TweenLite.to($('.appbutton'),slide_speed,{left: '+='+350, perspective: 1000, force3D: true,   ease: Power1.easeInOut});
												}
											}
										}
										else {
											$('.appbutton[data-number='+parseInt(stage)+']').isSelected();
											$("#remove").removeClass('pressed');
										}
										$current.remove();
										count-=1;
										arrow_next = 524 + (8-count)*0.5*(150+10);
										arrow_prev = 239 + (8-count)*0.5*(150+10);

									});
								}});

							}
					}
				}
				else if(mode == "rearrange"){
					$('.appbutton[data-number='+(parseInt(stage))+']').notSelected(.5);
					var $current = $('.appbutton[data-number='+(parseInt(stage))+']');


					// if($current.attr('data-type') == "folder"){
					// 	var $children = $('#'+$current.attr('id')+'> .appbutton-folder');
					// 	$children.each(function(index, element){
					// 		var origin_number = $(element).attr('data-number').split('-')[1];
					// 		$(element).attr('data-number', stage+'-'+origin_number);
					// 	});
					// }

					$('#app > .appbutton').each(function(index, element){
						if($(element).attr('data-type') == "folder"){
						var $children = $('#'+$(element).attr('id')+'> .appbutton-folder');
						var thisstage = $(element).attr('data-number');
						$children.each(function(index1, element1){
							var origin_number = $(element1).attr('data-number').split('-')[1];
							$(element1).attr('data-number', thisstage+'-'+origin_number);
						});
					}

					});

					$('.appbutton-folder').css('bottom', '-250px');

					TweenLite.to($('.next, .prev'), .001, {opacity:0, x: 0, z: 0.001, perspective: 1000, force3D: true, });
					for(var i = 0; i < 3; i++){
						tl1[i].kill();
						tl2[i].kill();
					}

					TweenLite.to($('#black'), .5, {opacity:0, zIndex:-1, ease: Power1.easeInOut, delay: .3});

					var $app = $('.appbutton');
					TweenLite.to($app, .8, {scale:1, ease: Power4.easeInOut, delay: .3});

					TweenMax.delayedCall(.3, function(){
						if(count <= 5) {
							for ( var i = 0; i < count; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-300*count)/2+i*(300+100/count)+10, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							}
						} else {
							for ( var i = 0; i < count; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-300*5-100)/2+i*(300+100/5)+10, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							}
						};

						if(position > 4) position = 4;
						else position = stage-1;

						if(stage > 5){
							TweenLite.to($('.appbutton'),slide_speed,{left: '-='+(350*(stage-5)), perspective: 1000, force3D: true,   ease: Power1.easeInOut, delay: .5});
							position = 4;
							position_move = stage - 5;
						}
						else position_move = 0;
						TweenMax.delayedCall(.7, function(){
							mode = "navigation";
							$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
						});
					});
				}
				else if(mode == "delete"){
					console.log("remove");

					if(delete_stage == 1) {
						$("#cancel").addClass('pressed');
						TweenLite.to($('#cancel'), .2, {backgroundColor: pressed, scaleX:1, scaleY:1, scaleZ:1, z: 0.001});
					} else{
						TweenLite.to($('#confirm'), .2, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true, });
					}

						TweenLite.to($('#delete .message'), .8, {opacity:0, ease: Power4.easeInOut});
						TweenLite.to($('#delete .optbutton'), .8, {opacity:0, y:'+=100', z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut, onComplete: function(){
							option_stage = 1;

							if(delete_stage == 1){
								TweenMax.delayedCall(.6,function(){
									mode = "navigation";
									$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
									TweenMax.delayedCall(scale_speed, function(){
										$("#cancel").removeClass('pressed');
									});
								});
							}
							else {
								console.log("confirm");
								TweenMax.delayedCall(.2, function(){
									var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
									var $child = $('#'+$current.attr('id')+' > .appbutton-folder');
									var child_count = $child.length;

									var $home = $child.clone();
									$home.each(function(index, element){
										$(this).removeClass('appbutton-folder').addClass('appbutton').attr({'data-number': parseInt(count)+parseInt(index)+1, 'data-type':'card'});
										$(this).css({'margin-left': (1920-300*5)/2+(parseInt(count)+parseInt(index))*(300+100/5)-40, 'left':-350*position_move, 'opacity': 1});


										TweenLite.to($('#'+$(this).attr('id') + ' > p'), .3, {fontSize: '19pt', bottom: '50px', ease: Power2.easeInOut});


										TweenLite.to(this, .001, {width: isSelected_cardsize, height: isSelected_cardsize, bottom: '0px', perspective: 1000, force3D: true, });
									});

									$('#app').append($home);
									count+=$child.length;

									TweenLite.to($current, .4, {y:'+=200', z: 0.001, opacity: 0, perspective: 1000, force3D: true,   ease: Power2.easeInOut, onComplete:function(){

										for(var i = parseInt(stage)+1; i <= count; i++){
											var $follow = $('.appbutton[data-number='+(parseInt(i))+']');
											$follow.attr('data-number', i-1);
											console.log($follow);
											if(count <= 5) {
												if(stage == 1){
													TweenLite.to($follow, .4, {marginLeft: '-=162px', perspective: 1000, force3D: true,   ease: Power4.easeInOut});
													//TweenLite.to($('.next, .prev'), .4, {left:'-=162px', ease: Power4.easeInOut});

												} else {
													TweenLite.to($follow, .4, {marginLeft: '-=478px', perspective: 1000, force3D: true,   ease: Power4.easeInOut});
													//TweenLite.to($('.next, .prev'), .4, {left:'-=478px', ease: Power4.easeInOut});
												}
											}
											else {
												TweenLite.to($follow, .4, {marginLeft: '-=320px', perspective: 1000, force3D: true,   ease: Power4.easeInOut, delay: .2});
												//TweenLite.to($('.next, .prev'), .4, {left:'-=320px', ease: Power4.easeInOut});
											}

										}

										TweenMax.delayedCall(.2, function(){
											if(stage != 1) {
												$('.appbutton[data-number='+(parseInt(stage-1))+']').isSelected();
												stage = stage - 1;
												if(position_move == 0) {
													position--;
													if(count <= 5) {
														TweenLite.to($('.appbutton'),slide_speed,{marginLeft: '+='+158, perspective: 1000, force3D: true,   ease: Power1.easeInOut});
													}
												}
												else if(position_move == count-5){
													position_move--;
													TweenLite.to($('.appbutton'),slide_speed,{left: '+='+350, perspective: 1000, force3D: true,   ease: Power1.easeInOut});
												}
												else{
													if(position != 0) position--;
													else {
														position_move--;
														TweenLite.to($('.appbutton'),slide_speed,{left: '+='+350, perspective: 1000, force3D: true,   ease: Power1.easeInOut});
													}
												}
											}
											else {
												$('.appbutton[data-number='+parseInt(stage)+']').isSelected();
											}
											$current.remove();
											count-=1;
											mode = "navigation";

											arrow_next = 524 + (8-count)*0.5*(150+10);
											arrow_prev = 239 + (8-count)*0.5*(150+10);
											delete_stage = 1;
										});
									}});
								});
							}
							$('.selectedOption').notSelected_option();

						}});
						TweenLite.to($('.transition'), trans_speed-1, {opacity: 0, perspective: 1000, force3D: true,   ease: Power4.easeIn, delay: .2, onComplete: function(){
							TweenLite.to($('#delete'), .001, {zIndex:-1, ease: Power4.easeInOut});
						}});
						circle_transition_r();

				}
				else if(mode == "addfolder") {
					if(folder_level == 0 && addfolder_stage == 2){
						if ($('#addfolder-done p').hasClass('inactive')) console.log("inactive");
						else {
							flag = false;
							var offset = 0;
							var removed = [];
							console.log("done");
							$('#addfolder-done p').addClass('pressed').css('color', '#FFF');
							TweenLite.to($('#addfolder-done'), .3, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   background: '#5eabd9', onComplete: function(){
								TweenLite.to($('.transition'), trans_speed, {opacity: 0, perspective: 1000, force3D: true,   ease: Power4.easeOut, delay: .3});
								circle_transition_r();

								//Step 1
								var folder_card = [];
								$('.appselected').each(function(index, element){
									var id = $(this).attr('id');
									folder_card[index] = $('#app > .appbutton#'+id).clone();
									removed.push(folder_card[index].attr('data-number'));
									folder_card[index].removeClass('appbutton').addClass('appbutton-folder');
									folder_card[index].attr('data-type', 'folder-card');
									folder_card[index].css({'width':notSelected_cardsize, 'height': notSelected_cardsize, 'bottom': '-250px'});
									if($('#app > .appbutton#'+id).attr('data-number') <= stage) offset++;
									$('#app > .appbutton#'+id).remove();
									count--;
								});
								console.log(removed);

								$('#app > .appbutton').each(function(index, element){
									$(this).attr('data-number', parseInt(index)+1);
									for ( var i = 0; i < count; i++ ) {
										var $getapp = $('#app > .appbutton[data-number='+(i+1)+']');
										$getapp.css({'margin-left':(1920-300*5)/2+i*(300+100/5)-40, 'left':-350*position_move});
									}
								});

								TweenLite.to($('#addfolder'), .5, {opacity: 0, zIndex: -1, onComplete: function(){


									//Step 2
									//var $current = $('.appbutton[data-number='+stage+']');

									for(var i = count; i >= parseInt(stage)+1-offset; i--){
										var $follow = $('.appbutton[data-number='+(parseInt(i))+']');
										//console.log(i);
										$follow.attr('data-number', parseInt(i)+1);
										//console.log($follow);
										TweenLite.to($follow, .4, {marginLeft: '+=320px', perspective: 1000, force3D: true,   ease: Power4.easeInOut, delay: .2});
									}
									stage++;
									stage-=offset;
									count++;
									total++;
									position++;
									position-=offset;

									arrow_next = 524 + (8-count)*0.5*(150+10);
									arrow_prev = 239 + (8-count)*0.5*(150+10);

									if(position >= 5){
										TweenLite.to($('.appbutton'),slide_speed,{left: '-=350', perspective: 1000, force3D: true,   ease: Power1.easeInOut, onComplete: function(){
											//flag = true;
										}});
										position = 4;
										position_move += 1;
									}

									var folder_amount = $('.appbutton[data-type="folder"]').length;
									folder_amount++;
									
									if(stage == 1) {
										var $current = $('.appbutton[data-number='+(stage+1)+']');
										console.log($current); console.log("???");
										$current.before('<div class="appbutton" id="app'+pad(total,2)+'" data-type="folder" data-number="'+stage+'" data-content="My Folder'+folder_amount+'"><p>My Folder '+folder_amount+'</p>');
									}
									else {
										var $current = $('.appbutton[data-number='+(stage-1)+']');
										console.log($current); console.log("???");
										$current.after('<div class="appbutton" id="app'+pad(total,2)+'" data-type="folder" data-number="'+stage+'" data-content="My Folder'+folder_amount+'"><p>My Folder '+folder_amount+'</p>');
									}
									var $current = $('.appbutton[data-number='+stage+']');
									console.log($current);


									for(var i = 0; i < folder_card.length; i++){
										folder_card[i].attr('data-number', stage+'-'+(parseInt(i)+1));
										folder_card[i].css({'margin-left': 92+130*i, 'left':0});
										$current.append(folder_card[i]);

									}

									$current.css('background-color', '#5a5a5a');
									$current.css({'margin-left': (1920-300*5)/2+(stage-1)*(300+100/5)-40, 'left':-350*position_move});
									$current.css('z-index', 1);
									$current.prepend('<span class="icon_folder"></span>');

									TweenMax.delayedCall(.5, function(){
										TweenLite.fromTo($current, .4, {scale: 0,opacity: 0, perspective: 1000, force3D: true, }, {scale: 1.6, perspective: 1000, force3D: true,   border:'6px #FFF solid', opacity: 1, y: '-=100', onComplete: function(){
											$current.isSelected();
										}});
									});

									mode = "navigation";
									level = 1;
									setting_stage = 1;
									applistposition = 1;
									appselected = 0;
									//stage -= offset;

									$('#addfolder-number--selected').text(appselected);
									TweenLite.to($('#addfolder-done'), .01, {backgroundColor: 'rgba(0,0,0,.8)'});
									$('#addfolder-done p').removeClass('pressed');
									$('#addfolder-done p').addClass('inactive').css('color','#aaa');
									folder_level = 1;
								}});
							}});
						}
					}
					else if(folder_level == 1){
						console.log("check app number "+applistposition);
						$('.applist').each(function(index,element){
							if(index == applistposition-1) {
								if($(this).hasClass('appselected')){
									var $currentID = $(this).attr('id');
									TweenLite.to($(this), .1, {backgroundColor: colors[$currentID]});
									$(this).removeClass('appselected');
									appselected--;
								}
								else {
									TweenLite.to($(this), .1, {backgroundColor: 'rgba(94,171,217,.9)'});
									$(this).addClass('appselected');
									appselected++;
								}
							}
						});
						$('#addfolder-number--selected').text(appselected);

						if(appselected != 0) $('#addfolder-done p').removeClass('inactive').css('color', '#fff');
						else $('#addfolder-done p').addClass('inactive').css('color', '#aaa');
					}
				}

				else if(mode == "rearrange-folder"){
					var $current = $('.appbutton[data-number='+(parseInt(stage))+'][data-type="folder"]');
					TweenLite.to($('#'+$current.attr('id')+' > .appbutton-folder'), speed3, {opacity: 0});

					TweenLite.to($('#'+$current.attr('id')+" p"), speed3, {'opacity': 1});
					TweenLite.to($('#'+$current.attr('id')+" .icon_folder"), speed3, {'backgroundSize': '40% 40%'});

					TweenLite.to($('.next, .prev'), .001, {opacity:0, x: 0});
					for(var i = 0; i < 3; i++){
						tl1[i].kill();
						tl2[i].kill();
					}

						var $select = $('.selected[data-number='+stage+']');

						var $child = $('.appbutton[data-number='+stage+'][data-type="folder"] > .appbutton-folder');
						var rearrange_count = $child.length+1;

						for(var i = rearrange_count-1; i >= rearrange_stage; i--){
							$('.appbutton-folder[data-number='+stage+'-'+i+']').attr('data-number', stage+'-'+(i+1));
						}
						var $clone = $select.clone().removeClass('selected').removeClass('appbutton').addClass('appbutton-folder').attr('data-type', 'folder-card').css({'opacity':0}).attr('data-number', stage+'-'+rearrange_stage);
						var $parent = $('.appbutton[data-number='+stage+'][data-type="folder"]');

						var down = 0;
						if(rearrangelevel == 1) {
							down = 0;
							//$clone.css('background-color', 'rgba(204,204,204, 1)');
						}
						else down = 1;
						TweenLite.to($clone, .001, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, zIndex:0, perspective: 1000, force3D: true,   x: '+=5px', y: '-='+235*down+'px', ease: Power4.easeInOut});
						$parent.append($clone);


						$clone.css({'border': '0px'});
						console.log($current.attr('id'));


						if(rearrangelevel == 1){
							TweenLite.to($select, .8, {opacity: 0, ease: Power4.easeInOut, delay: .3, onComplete: function(){
								$select.remove();
							}});
						}
						else{
							TweenLite.to($select, speed3, {opacity: 0, ease: Power4.easeInOut, onComplete: function(){
								TweenLite.to($('.next, .prev'), .3, {y:'-=230px', z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
								$select.remove();
							}});
						}
						count--;
						rearrangelevel = 1;
						rearrange_stage = 1;
						arrow_next = 524 + (8-count)*0.5*(150+10);
						arrow_prev = 239 + (8-count)*0.5*(150+10);


					TweenLite.to($('#black'), .5, {opacity:0, zIndex:-1, ease: Power1.easeInOut, delay: .3});

					var $app = $('.appbutton');
					TweenLite.to($app, .8, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut, delay: .3});

						$('.appbutton-folder').each(function(){
							console.log($(this).css('margin-left')+"!0");
						});

					TweenMax.delayedCall(.3,function(){
/***********************/
						$('#'+$current.attr('id')+' > .appbutton-folder').each(function(index, element){
							var k = $(this).attr('data-number').split('-')[1]-1;
							console.log(k);
							$(this).css({width: notSelected_cardsize, height: notSelected_cardsize, 'margin-left': 92+130*k, 'left':0, bottom: '-250px'});
						});
/***********************/


						$('.appbutton-folder').each(function(){
							console.log($(this).css('margin-left')+"!1");
						});

						if(count <= 5) {
							for ( var i = 0; i < count; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-300*count)/2+i*(300+100/count)-40, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							}
						} else {
							for ( var i = 0; i < count; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), .8, {marginLeft:(1920-300*5-100)/2+i*(300+100/5)-40, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							}
						};

						$('.appbutton-folder').each(function(){
							console.log($(this).css('margin-left')+"!2");
						});

						if(position > 4) position = 4;
						else position = stage-1;

						if(stage > 5){
							TweenLite.to($('.appbutton'),slide_speed,{left: '-='+(350*(stage-5)), perspective: 1000, force3D: true,   ease: Power1.easeInOut, delay: .5});
							position = 4;
							position_move = stage - 5;
						}
						else position_move = 0;

						$('.appbutton-folder').each(function(){
							console.log($(this).css('margin-left')+"!3");
						});


						TweenMax.delayedCall(.7, function(){
							mode = "navigation";
							$('.appbutton[data-number='+(parseInt(stage))+'][data-type="folder"]').isSelected();

							$('.appbutton-folder').each(function(){
								console.log($(this).css('margin-left')+"?");
							});

						});
					});
				}
			}
		}
/********************************************************************************************************************************

		KEY EVENTS - ESC

********************************************************************************************************************************/

		else if(e.keyCode == 8 || e.keyCode == 27) {
			if(flag) {
				if(mode == "optionmode" || mode == "dummymode" || mode == "addfolder") {
					flag = false;
					$('.transition').transition_closing(mode);
				}
				if(mode == "navigation" && level == 1) location.reload();
			}
		}
		
/********************************************************************************************************************************

		KEY EVENTS - UP

********************************************************************************************************************************/

		else if(e.keyCode == 38) {
			console.log("up");

			playWave(false);

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
					else if(level == 3) {
						flag = false;
						rearrange_nav_stage = 1;
						$('.cardselected').notSelected();
						$('.cardselected').removeClass('cardselected');

/******************************************************************************///backagain***
						TweenLite.to($('#app > .appbutton'), .3, {y: '+=185px', perspective: 1000, force3D: true,   ease: Power2.easeInOut});
						$('#'+$getapp.attr('id')+' > .appbutton-folder').each(function(index, element){
							var m = (parseInt($(this).css('margin-left').split('p')[0])+230)/2.5+'px';
							TweenLite.to($('#'+$(this).attr('id') + ' > p'), .3, {fontSize: '12pt', bottom: '20px', ease: Power2.easeInOut});
							$(this).removeClass('focus');
							TweenLite.to(this, .3, {width: notSelected_cardsize, height: notSelected_cardsize, bottom: '-250px',z: 0.001, perspective: 1000, force3D: true,   marginLeft: m, ease: Power2.easeInOut});
						});
						//TweenLite.to($('#app'), .3, {scale:1, transformOrigin: '50% 50%'});

						//$getapp.isSelected();
						TweenLite.to($getapp, .3, {scaleX:1.6, scaleY:1.6, scaleZ:1.6, zIndex: 10, z: 0.001, perspective: 1000, force3D: true,   border: '6px #FFF solid', ease: Power4.easeInOut, onComplete: function(){
							flag = true;
						}});
						level = 1;
					}
				}
				else if(mode =="addfolder"){
					total_level = 1 + $('.applist').length/8;
					if(folder_level != 0) {
						flag = false;
						folder_level--;
						$('.selected').notSelected();
						//todo: highlight "done"
						if($('#addfolder-done p').hasClass('inactive')) ;
						else TweenLite.to($('#addfolder-done p'), .3, { color: "#000"});
						TweenLite.to($('#addfolder-done'), .3, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   backgroundColor:'rgba(255,255,255,1)', onComplete: function(){
							flag = true;
						}});
					}
				}
				else if(mode == "rearrange-folder"){
					if(rearrangelevel == 2 && rearrange_stage == 1){
						flag = false;
						rearrangelevel = 1;
						var $current = $('.selected[data-number='+stage+']');
						TweenLite.to($current, speed3, {/*backgroundColor: 'rgba(204,204,204,0.5)',*/ y: '-=235px', z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
						var $follow = $('.appbutton[data-number='+stage+'] > .appbutton-folder');
						TweenLite.to($follow, speed3, {marginLeft: '-=160px', perspective: 1000, force3D: true,   ease: Power4.easeInOut, onComplete: function(){
							flag = true;
						}});
						TweenLite.to($('.next, .prev'), .3, {y:'-=235px', z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});

						if(stage == count) $('.next').css('display', 'none');
						else if(stage == 1) $('.prev').css('display', 'none');
						else {
							$('.next').css('display', 'block');
							$('.prev').css('display', 'block');
						}

					}
				}
		}

/********************************************************************************************************************************

		KEY EVENTS - DOWN

********************************************************************************************************************************/
		else if(e.keyCode == 40) {
			console.log("down");

			playWave(false);

			if(flag){
				if(mode == "navigation"){
						// Apps
					var $getapp = $('.appbutton[data-number='+(parseInt(stage))+']');
					if(level == 1) {
						flag = false;
						if($getapp.attr('data-type')=="folder"){
							var $child = $('.appbutton-folder[data-number="'+stage+'-'+'1"]');


/******************************************************************************///again***
							TweenLite.to($('#app > .appbutton'), .3, {y: '-=185px', perspective: 1000, force3D: true,   ease: Power2.easeInOut});
							$('#'+$getapp.attr('id')+' > .appbutton-folder').each(function(index, element){
							TweenLite.to($('#'+$(this).attr('id') + ' > p'), .3, {fontSize: '19pt', bottom: '50px', ease: Power2.easeInOut});
							var m = $(this).css('margin-left').split('p')[0]*2.5-230+'px';
							$(this).addClass('focus');
							TweenLite.to(this, .3, {width: origin_cardsize, height: origin_cardsize, bottom: '-450px', z: 0.001, perspective: 1000, force3D: true,   marginLeft: m, ease: Power2.easeInOut});
						});
							//TweenLite.to($('#app'), .3, {scale:.8, transformOrigin: '50% 50%'});
							$child.addClass('cardselected');
							$child.isSelected();

							//$getapp.isSelected(1);
							TweenLite.to($getapp, .3, {scaleX:1, scaleY:1, scaleZ:1, zIndex: 1, z: 0.001, perspective: 1000, force3D: true,   border: '0px #FFF solid', ease: Power4.easeInOut});
							level = 3;
						}
						else{
							$getapp.notSelected();
							$('#filter').isSelected_setting();
							level++;
						}
					}
					// Settings
					else if(level == 0) {
						flag = false;
						$('.selected').notSelected_setting();
						$getapp.isSelected();
						level++;
						setting_stage = 1;
					}
					else if(level == 3) {
						flag = false;
						$('.cardselected').notSelected();
						$('.cardselected').removeClass('cardselected');

						//console.log($('#'+$getapp.attr('id')+' > .appbutton-folder'));

/******************************************************************************///backagain***
						TweenLite.to($('#app > .appbutton'), .3, {y: '+=185px', perspective: 1000, force3D: true,   ease: Power2.easeInOut});
						$('#'+$getapp.attr('id')+' > .appbutton-folder').each(function(index, element){
							TweenLite.to($('#'+$(this).attr('id') + ' > p'), .3, {fontSize: '12pt', bottom: '20px', ease: Power2.easeInOut});
							var m = (parseInt($(this).css('margin-left').split('p')[0])+230)/2.5+'px';
							TweenLite.to(this, .3, {width: notSelected_cardsize, height: notSelected_cardsize, bottom: '-250px', z: 0.001, perspective: 1000, force3D: true,    marginLeft: m, ease: Power2.easeInOut});
							$(this).removeClass('focus');
						});
						//TweenLite.to($('#app'), .3, {scale:1, transformOrigin: '50% 50%'});

						$getapp.notSelected();
						rearrange_nav_stage = 1;
						$('#filter').isSelected_setting();
						level = 2;
					}
				}
				else if(mode =="addfolder"){
					total_level = 1 + parseInt($('.applist').length/8);
					if(folder_level != total_level) {
						flag = false;
						folder_level++;
						addfolder_stage = 2;
						$('.applist[data-number=\"folder-card'+applistposition+'\"]').isSelected(1.5);
						TweenLite.to($('#addfolder-name p'), .3, {z: 0.001, perspective: 1000, force3D: true,   backgroundColor: "rgba(0,0,0,0)"});
						TweenLite.to($('#addfolder-name'), .3, {z: 0.001, perspective: 1000, force3D: true,   borderBottomColor: '#fff', borderWidth: '2px'});
						TweenLite.to($('#keyboard'), .6, {z: 0.001, perspective: 1000, force3D: true,   bottom: '-50%', ease: Power4.easeInOut});
						TweenLite.to($('#close'), .3, {opacity: 0});
						if($('#addfolder-done p').hasClass('inactive')) ;
						else TweenLite.to($('#addfolder-done p'), .3, { color: "#fff"});
						TweenLite.to($('#addfolder-done'), .3, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   backgroundColor:"rgba(0,0,0,.8)", onComplete: function(){
							flag = true;
						}});
					}
				}
				else if(mode == "rearrange-folder"){
					if(rearrangelevel == 1){
						flag = false;
						rearrangelevel = 2;
						var $current = $('.selected[data-number='+stage+']');
						TweenLite.to($current, speed3, {/*backgroundColor: 'rgba(204,204,204,1)',*/ y: '+=235px',z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
						var $follow = $('.appbutton[data-number='+stage+'] > .appbutton-folder');
						TweenLite.to($follow, speed3, {marginLeft: '+=160px', perspective: 1000, force3D: true,   ease: Power4.easeInOut, onComplete:function(){
							flag = true;
						}});
						TweenLite.to($('.next, .prev'), .3, {y:'+=235px',z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});

						$('.prev').css('display', 'none');
					}
				}
			}
		}
		
/********************************************************************************************************************************

		KEY EVENTS - LEFT

********************************************************************************************************************************/
		else if(e.keyCode == 37) {
			console.log("left");
			

			if(flag){
				if(mode == "rearrange"){
					if(currentposition != 1) {
						flag = false;
						var $current = $('.selected');
						var $next = $current.findNext('left');
						if($current.attr('data-type') == "card" && $next.attr('data-type') == "folder"){
							mode = "rearrange-folder";
							TweenLite.to($('#'+$next.attr('id')+" > p"), speed3, {'opacity': 0});
							TweenLite.to($('#'+$next.attr('id')+" .icon_folder"), speed3, {'backgroundSize': '80% 80%'});
							stage--;
							currentposition--;
							$current = $('#app > .appbutton[data-number="'+stage+'"]');

							for(var i = parseInt(stage)+1; i <= count; i++){

								var $follow = $('.appbutton[data-number='+(parseInt(i))+']');
								$follow.attr('data-number', parseInt(i)-1);
							}
							if(count <= 10) {
								for ( var i = 0; i < count-1; i++ ) {
									TweenLite.to($('.appbutton[data-number='+(i+1)+']'), speed3, {marginLeft:(1920-150*(count-1)-(count-2)*10)/2+i*(150+10)-150/2, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
								}
							} else {
								for ( var i = 0; i < count-1; i++ ) {
									TweenLite.to($('.appbutton[data-number='+(i+1)+']'), speed3, {marginLeft:(1920-150*10-90)/2+i*(150+90/5), perspective: 1000, force3D: true,   ease: Power4.easeInOut});
								}
							};
							$('#'+$next.attr('id')+' > .appbutton-folder').each(function(index, element){
								var k = $(this).attr('data-number').split('-')[1]-1;
								TweenLite.to(this, speed3, {opacity: 1, width: "180px", height: "180px", marginLeft: '+='+(-30+60*k)+'px', bottom: '-300px', perspective: 1000, force3D: true, });
							});
							TweenLite.to($current, speed3, {scaleX:.65, scaleY:.65, scaleZ:.65, z: 0.001, perspective: 1000, force3D: true,   x: '-=5px', z:0.001, /* backgroundColor: 'rgba(204,204,204,0.5)', */ease: Power4.easeInOut});
							TweenLite.to($next, speed3, {scaleX:.9, scaleY:.9, scaleZ:.9, z: 0.001, perspective: 1000, force3D: true,   zIndex: 2999, ease: Power4.easeInOut, onComplete: function(){
								flag = true;
							}});
							//$next.isSelected(1.2);
							TweenLite.to($('.next, .prev'), speed3, {x:'-=80px', z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
						}
						else {
							stage--;
							var m1 = $current.css('margin-left');
							var m2 = $next.css('margin-left');

							$current.moveUp();
							TweenLite.to($current, .2, {marginLeft: m2, ease: Power4.easeInOut, onComplete: function(){flag = true}});
							TweenLite.to($next, .2, {marginLeft: m1, ease: Power4.easeInOut, onComplete: function(){flag = true}});

							currentposition--;
							TweenLite.to($('.next, .prev'), .2, {x:'-=160px', z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
						}
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
				else if(mode == "rearrange-folder"){
					if(rearrangelevel == 1){
						flag = false;
						mode = "rearrange";
						$current = $('.selected[data-number='+stage+']');
						$current.moveUp();


						for(var j = count-1; j >= parseInt(stage); j--){
							//if (!$('#app > .appbutton[data-number='+(parseInt(j))+']').hasClass('selected')){
								var $follow = $('#app > .appbutton[data-number='+(parseInt(j))+']');

								$follow.attr('data-number', parseInt(j)+1);


							//}
						}
						$('.selected').attr('data-number', stage);

						if(count <= 10) {
							for ( var i = 0; i < count; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), speed3, {marginLeft:(1920-150*(count)-(count-1)*10)/2+i*(150+10)-150/2, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							}
						} else {
							for ( var i = 0; i < count-1; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), speed3, {marginLeft:(1920-150*10-90)/2+i*(150+90/5), perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							}
						};
						var nextstage = parseInt(stage)+1;
						$next = $('.appbutton[data-number='+nextstage+']');
						TweenLite.to($('#'+$next.attr('id')+" > p"), speed3, {'opacity': 1});
						TweenLite.to($('#'+$next.attr('id')+" .icon_folder"), speed3, {'backgroundSize': '40% 40%'});
						$('#'+$next.attr('id')+' > .appbutton-folder').each(function(index, element){
							var k = $(this).attr('data-number').split('-')[1]-1;
							TweenLite.to(this, speed3, {opacity: 0, width: notSelected_cardsize, height: notSelected_cardsize, marginLeft: '-='+(-30+60*k)+'px', bottom: '-300px', perspective: 1000, force3D: true, });
						});

						TweenLite.to($current, speed3, {scaleX:.9, scaleY:.9, scaleZ:.9, z: 0.001, perspective: 1000, force3D: true,   x: 0,/*  backgroundColor: 'rgba(204,204,204,1)',*/ ease: Power4.easeInOut});
						TweenLite.to($next, speed3, {scaleX:.5, scaleY:.5, scaleZ:.5, z: 0.001, perspective: 1000, force3D: true,   zIndex: 1, ease: Power4.easeInOut, onComplete: function(){
							flag = true;
						}});
						//$next.isSelected(1.2);
						TweenLite.to($('.next, .prev'), speed3, {x:'-=80px', z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
					}
					else if(rearrangelevel == 2){

						var $child = $('.appbutton[data-number='+stage+'][data-type="folder"] > .appbutton-folder');

						//console.log($child[1]);
						var rearrange_count = $child.length+1;
						var $current = $('.selected[data-number='+stage+']');
						if(rearrange_stage != 1){
							flag = false;
							var m1 = $current.css('margin-left');
							var m2 = $('.appbutton-folder[data-number="'+stage+'-'+(rearrange_stage-1)+'"]').css('margin-left');

							TweenLite.to($current, speed3, {marginLeft: '-=160px', perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							TweenLite.to($('.appbutton-folder[data-number="'+stage+'-'+(rearrange_stage-1)+'"]'), speed3, {marginLeft: '+=160px', perspective: 1000, force3D: true,   ease: Power4.easeInOut, onComplete: function(){
								flag = true;
							}});
							rearrange_stage--;
							TweenLite.to($('.next, .prev'), .3, {x:'-=160px', z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							if(rearrange_stage == rearrange_count){
								$('.next').css('display', 'none');
							}
							else if(rearrange_stage == 1) {
								$('.prev').css('display', 'none');
							}
							else {
								$('.next').css('display', 'block');
								$('.prev').css('display', 'block');
							}
						}
					}
				}

				else if(mode == "navigation"){
					// Apps
					if(level == 1) {
						if(stage != 1) {
							playWave(false);
							flag = false;
							stage--;
							position--;
							//Move Apps
							if(position < 0){
								flag = false;
								TweenLite.to($('.appbutton'),slide_speed,{left: '+=350', perspective: 1000, force3D: true,   ease: Power1.easeInOut, onComplete: function(){
									//flag = true;
								}});
								position = 0;
								position_move-=1;
							}
							$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
							$('.appbutton[data-number='+(parseInt(stage+1))+']').notSelected();
						}
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
					else if(level == 2){
						var filter_count = $('.filter-section li').length;
						if(filter_stage != 1){
							//flag = false;


							$('.filter-section li').eq(filter_stage-1).animate({  textIndent: 10 }, {
							    step: function(now,fx) {
							      $(this).css('-webkit-transform','scale('+now/10+')');
								  $(this).css('transform','scale('+now/10+')');
								  $(this).css('-moz-transform','scale('+now/10+')');

							      if($(this).hasClass('active'));
							      else $(this).css('color','#CCC');
							    },duration:filter_duration
							},'linear');

							$('.filter-section li').eq(filter_stage-2).animate({  textIndent: 12 }, {
							    step: function(now,fx) {
							      $(this).css('-webkit-transform','scale('+now/10+')');
								  $(this).css('transform','scale('+now/10+')');
								  $(this).css('-moz-transform','scale('+now/10+')');

							      if($(this).hasClass('active'));
							      else $(this).css('color','#FFF');
							    },duration:filter_duration
							},'linear');

							filter_stage--;
						}
					}
					else if(level == 3){
						var rearrange_nav_count = $('.appbutton[data-number='+(parseInt(stage))+'] > .appbutton-folder').length;
						if(rearrange_nav_stage > 1){
							flag = false;
							$('.cardselected').notSelected();
							$('.cardselected').removeClass('cardselected');
							var $child = $('.appbutton-folder[data-number="'+stage+'-'+(parseInt(rearrange_nav_stage)-1)+'"]');
							$child.addClass('cardselected');
							$child.isSelected();
							rearrange_nav_stage--;
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
						TweenLite.to($(deletelist[delete_stage-1]), .4, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut, perspective: 1000});
						$(deletelist[delete_stage-2]).isSelected_option();
						delete_stage--;
					}
				}
				else if(mode == "addfolder"){
					if(folder_level == 1){
						if(applistposition > 1) {
							applistposition--;
							$('.applist[data-number=\"folder-card'+(applistposition+1)+'\"]').notSelected();
							$('.applist[data-number=\"folder-card'+applistposition+'\"]').isSelected(1.5);

						}
					}
					else if(folder_level == 0){
						if(addfolder_stage == 2){
							addfolder_stage--;
							flag = false;
							TweenLite.to($('#addfolder-name p'), .3, {z: 0.001, perspective: 1000, force3D: true,   backgroundColor: "#4B788C"});
							TweenLite.to($('#addfolder-name'), .3, {z: 0.001, perspective: 1000, force3D: true,   borderBottomColor: '#5eabd9', borderWidth: '4px'});
							TweenLite.to($('#keyboard'), .6, {z: 0.001, perspective: 1000, force3D: true,   bottom: '0', ease: Power4.easeInOut});
							TweenLite.to($('#close'), .3, {opacity: 1});

							if($('#addfolder-done p').hasClass('inactive')) ;
							else TweenLite.to($('#addfolder-done p'), .3, { color: "#FFF"});
							TweenLite.to($('#addfolder-done'), .3, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   backgroundColor:"rgba(0,0,0,.8)", onComplete: function(){
								flag = true;
							}});
						}
					}
				}
			}
		}

		/********************************************************************************************************************************

		KEY EVENTS - RIGHT

		********************************************************************************************************************************/

		else if(e.keyCode == 39) {
			console.log("right");
			
			if(flag){
				if(mode == "rearrange"){
					if(currentposition != count) {
						flag = false;
						var $current = $('.selected');
						var $next = $current.findNext('right');
						if($current.attr('data-type') == "card" && $next.attr('data-type') == "folder"){
							mode = "rearrange-folder";
							TweenLite.to($('#'+$next.attr('id')+" > p"), speed3, {'opacity': 0});
							TweenLite.to($('#'+$next.attr('id')+" .icon_folder"), speed3, {'backgroundSize': '80% 80%'});


							//$current = $('#app > .appbutton[data-number='+stage+']');

							for(var i = parseInt(stage)+1; i <= count; i++){
								var $follow = $('.appbutton[data-number='+(parseInt(i))+']');
								$follow.attr('data-number', parseInt(i)-1);
							}
							if(count <= 10) {
								for ( var i = 0; i < count-1; i++ ) {
									TweenLite.to($('.appbutton[data-number='+(i+1)+']'), speed3, {marginLeft:(1920-150*(count-1)-(count-2)*10)/2+i*(150+10)-150/2, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
								}
							} else {
								for ( var i = 0; i < count-1; i++ ) {
									TweenLite.to($('.appbutton[data-number='+(i+1)+']'), speed3, {marginLeft:(1920-150*10-90)/2+i*(150+90/5), perspective: 1000, force3D: true,   ease: Power4.easeInOut});
								}
							};
							$('#'+$next.attr('id')+' > .appbutton-folder').each(function(index, element){
								var k = $(this).attr('data-number').split('-')[1]-1;
								$(this).attr('data-number', stage+'-'+(k+1));
								TweenLite.to(this, speed3, {opacity: 1, width: '180px', height: '180px', marginLeft: '+='+(-30+60*k)+'px', bottom: '-300px', perspective: 1000, force3D: true, });
							});

							TweenLite.to($current, speed3, {scaleX:.65, scaleY:.65, scaleZ:.65, z: 0.001, perspective: 1000, force3D: true,   x: '-=5px', /* backgroundColor: 'rgba(204,204,204,0.5)' ,*/ ease: Power4.easeInOut});
							TweenLite.to($next, speed3, {scaleX:.9, scaleY:.9, scaleZ:.9, z: 0.001, perspective: 1000, force3D: true,   zIndex: 2999, ease: Power4.easeInOut, onComplete: function(){
								flag = true;
							}});
							//$next.isSelected(1.2);
							TweenLite.to($('.next, .prev'), speed3, {x:'+=80px', z:0.001, ease: Power4.easeInOut});
						}
						else {
							stage++;
							var m1 = $current.css('margin-left');
							var m2 = $next.css('margin-left');
							$current.moveDown();
							TweenLite.to($current, .2, {marginLeft: m2, ease: Power4.easeInOut, onComplete: function(){flag = true}});
							TweenLite.to($next, .2, {marginLeft: m1, ease: Power4.easeInOut, onComplete: function(){flag = true}});

							currentposition++;
							TweenLite.to($('.next, .prev'), .2, {x:'+=160px', z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
						}
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
				else if(mode == "rearrange-folder"){
					if(rearrangelevel == 1){
						mode = "rearrange";

						flag = false;
						$current = $('.selected[data-number='+stage+']');
						$current.moveDown();

						for(var j = count-1; j >= parseInt(stage)+1; j--){
							//if (!$('#app > .appbutton[data-number='+(parseInt(j))+']').hasClass('selected')){
								var $follow = $('#app > .appbutton[data-number='+(parseInt(j))+']');

								$follow.attr('data-number', parseInt(j)+1);


							//}
						}
						stage++;
						$('.selected').attr('data-number', stage);

						if(count <= 10) {
							for ( var i = 0; i < count; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), speed3, {marginLeft:(1920-150*(count)-(count-1)*10)/2+i*(150+10)-150/2, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							}
						} else {
							for ( var i = 0; i < count-1; i++ ) {
								TweenLite.to($('.appbutton[data-number='+(i+1)+']'), speed3, {marginLeft:(1920-150*10-90)/2+i*(150+90/5), perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							}
						};
						var nextstage = parseInt(stage)-1;
						$next = $('.appbutton[data-number='+nextstage+']');
						TweenLite.to($('#'+$next.attr('id')+" > p"), speed3, {'opacity': 1});
						TweenLite.to($('#'+$next.attr('id')+" .icon_folder"), speed3, {'backgroundSize': '40% 40%'});
						$('#'+$next.attr('id')+' > .appbutton-folder').each(function(index, element){
							var k = $(this).attr('data-number').split('-')[1]-1;
							TweenLite.to(this, speed3, {opacity: 0, width: notSelected_cardsize, height: notSelected_cardsize, marginLeft: '-='+(-30+60*k)+'px', bottom: '-300px'});
						});
						TweenLite.to($current, speed3, {scaleX:.9, scaleY:.9, scaleZ:.9, z: 0.001, perspective: 1000, force3D: true,   x: 0,  /*backgroundColor: 'rgba(204,204,204,1)',*/ ease: Power4.easeInOut});
						TweenLite.to($next, speed3, {scaleX:.5, scaleY:.5, scaleZ:.5, z: 0.001, perspective: 1000, force3D: true,   zIndex: 1, ease: Power4.easeInOut, onComplete: function(){
							flag = true;
						}});
						//$next.isSelected(1.2);
						currentposition++;
						TweenLite.to($('.next, .prev'), speed3, {x:'+=80px', z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
					}
					else if(rearrangelevel == 2){

						var $child = $('.appbutton[data-number='+stage+'][data-type="folder"] > .appbutton-folder');
						//console.log($child[0]);
						var rearrange_count = $child.length+1;
						var $current = $('.selected[data-number='+stage+']');
						if(rearrange_stage != rearrange_count){
							flag = false;
							var m1 = $current.css('margin-left');
							var m2 = $('.appbutton-folder[data-number="'+stage+'-'+rearrange_stage+'"]').css('margin-left');

							TweenLite.to($current, speed3, {marginLeft: '+=160px', perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							TweenLite.to($('.appbutton-folder[data-number="'+stage+'-'+rearrange_stage+'"]'), speed3, {marginLeft: '-=160px', perspective: 1000, force3D: true,   ease: Power4.easeInOut, onComplete: function(){
								flag = true;
							}});
							rearrange_stage++;
							TweenLite.to($('.next, .prev'), .3, {x:'+=160px', z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
							if(rearrange_stage == rearrange_count){
								$('.next').css('display', 'none');
							}
							else if(rearrange_stage == 1) {
								$('.prev').css('display', 'none');
							}
							else {
								$('.next').css('display', 'block');
								$('.prev').css('display', 'block');
							}
						}
					}
				}
				else if(mode == "navigation") {
					// Apps
					if(level == 1) {
						if(stage != count) {
							playWave(false);
							flag = false;
							stage++;
							position++;
							//Move Apps
							if(position >= 5){
								flag = false;
								TweenLite.to($('.appbutton'),slide_speed,{left: '-=350', perspective: 1000, force3D: true,   ease: Power1.easeInOut, onComplete: function(){
									//flag = true;
								}});
								position = 4;
								position_move += 1;
							}
							$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
							$('.appbutton[data-number='+(parseInt(stage-1))+']').notSelected();
						}
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
					else if(level == 2){
						var filter_count = $('.filter-section li').length;
						if(filter_stage != filter_count){
							//flag = false;


							$('.filter-section li').eq(filter_stage-1).animate({  textIndent: 10 }, {
							    step: function(now,fx) {
							      $(this).css('-webkit-transform','scale('+now/10+')');
								  $(this).css('transform','scale('+now/10+')');
								  $(this).css('-moz-transform','scale('+now/10+')');

							      if($(this).hasClass('active'));
							      else $(this).css('color','#CCC');
							    },duration:filter_duration
							},'linear');

							$('.filter-section li').eq(filter_stage).animate({  textIndent: 12 }, {
							    step: function(now,fx) {
							      $(this).css('-webkit-transform','scale('+now/10+')');
								  $(this).css('transform','scale('+now/10+')');
								  $(this).css('-moz-transform','scale('+now/10+')');

							      if($(this).hasClass('active'));
							      else $(this).css('color','#FFF');
							    },duration:filter_duration
							},'linear');

							filter_stage++;
						}
					}
					else if(level == 3){
						var rearrange_nav_count = $('.appbutton[data-number='+(parseInt(stage))+'] > .appbutton-folder').length;
						if(rearrange_nav_stage < rearrange_nav_count){
							flag = false;




							$('.cardselected').notSelected();
							$('.cardselected').removeClass('cardselected');
							var $child = $('.appbutton-folder[data-number="'+stage+'-'+(parseInt(rearrange_nav_stage)+1)+'"]');
							$child.addClass('cardselected');
							$child.isSelected();
							rearrange_nav_stage++;
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
						TweenLite.to($(deletelist[delete_stage]), speed3, {scaleX:1.3, scaleY:1.3, scaleZ:1.3, z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut, perspective: 1000, onComplete: function(){
							flag = true;
						}});
						delete_stage++;
					}
				}
				else if(mode == "addfolder"){
					if(folder_level == 1){
						if(applistposition != $('.applist').length) {
							applistposition++;
							$('.applist[data-number=\"folder-card'+(applistposition-1)+'\"]').notSelected();
							$('.applist[data-number=\"folder-card'+applistposition+'\"]').isSelected(1.5);

						}
					}
					else if(folder_level == 0){
						if(addfolder_stage == 1){
							flag = false;
							addfolder_stage++;
							TweenLite.to($('#addfolder-name p'), .3, {z: 0.001, perspective: 1000, force3D: true,   backgroundColor: "rgba(0,0,0,0)"});
							TweenLite.to($('#addfolder-name'), .3, {z: 0.001, perspective: 1000, force3D: true,   borderBottomColor: '#fff', borderWidth: '2px'});
							TweenLite.to($('#keyboard'), .6, {z: 0.001, perspective: 1000, force3D: true,   bottom: '-50%', ease: Power4.easeInOut});
							TweenLite.to($('#close'), .3, {opacity: 0});
							if($('#addfolder-done p').hasClass('inactive')) ;
 							else TweenLite.to($('#addfolder-done p'), .3, { color: "#000"});
							TweenLite.to($('#addfolder-done'), .3, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   backgroundColor: "rgba(255,255,255,1)", onComplete: function(){
								flag = true;
							}});
						}
					}
				}
			}
		}
	}
});


/********************************************************************************************************************************

	INITIAL FUNCTIONS

********************************************************************************************************************************/

function initSmartHome(){
	updateClock();
	initColor();
	initPosition();
	
	// Animate Waves
	wave[0] = new TimelineMax({repeat:-1});
	wave[1] = new TimelineMax({repeat:-1});
	wave[0].fromTo($('.wave01a'), 3, {x:'0px'},{x:'-600px', ease: Linear.easeNone});
	wave[1].fromTo($('.wave01b'), 3.1, {x:'-100px'},{x:'-700px', ease: Linear.easeNone});
	playWave(false);
}

function pad (str, max) {
	str = str.toString();
	return str.length < max ? pad("0" + str, max) : str;
}

function initColor(){
	for (var i = 0; i < Object.keys(colors).length; i++){
		var $ID = "app0"+(i+1);
		var $getapp = $("#"+$ID);
		$getapp.css('background-color',colors[$ID]);
	}
	var $currentID = ($('.appbutton[data-number='+stage+']').attr('id'));
	TweenLite.to($('.transition'), .001, {backgroundColor: colors[$currentID]});
	TweenLite.to($('#dummy'), .001, {backgroundColor: colors[$currentID]});
}

function initPosition(){
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
	var margink = 0;
	$('.filter-section li').each(function(index, element){
		$(this).css('margin-left', parseInt(index+1)*50 + parseInt(margink));
		margink += $(this).width();
	});

	var $app = $('.appbutton');
	$app.opening();
	TweenMax.delayedCall(1.4,
		function(){
			$('#app01').isSelected();
		}
	);
}

function updateClock () {
	//Get Time Info
	var d = new Date();
	var h = ("0"+d.getHours()).slice(-2);
	var m = ("0"+d.getMinutes()).slice(-2);
	var time = h+":"+m;
	$('#time').text(time);
	$('.ampm').css('right', $('#time').width()+20);

	//Update Every Second
	setInterval(function() {
		var d = new Date();
		var h = ("0"+d.getHours()).slice(-2);
		var m = ("0"+d.getMinutes()).slice(-2);
		var time = h+":"+m;
		$('#time').text(time);
		$('.ampm').css('right', $('#time').width()+20);
  	}, 1 * 1000);
	return true;
}

function playWave (b) {
	if(b){
		var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
		var appid = $current.attr('id').split('0')[1];

		if(filtering && waveReseting){
			console.log("go");
			waveReset = [true, true, true, true];
			waveReseting = false;
		}
		if(filter_mode == "all" && !waveReseting){
			console.log("back");
			waveReset = [true, true, true, true];
			waveReseting = true;	
		}

		if(waveReset[appid]){
			console.log("play");
			wave[appid*2-2] = new TimelineMax({repeat:-1});
			wave[appid*2-1] = new TimelineMax({repeat:-1});
	  		wave[appid*2-2].fromTo($('.wave0'+appid+'a'), 3, {x:'0px'},{x:'-600px', perspective: 1000, force3D: true,   ease: Linear.easeNone});
  			wave[appid*2-1].fromTo($('.wave0'+appid+'b'), 3.1, {x:'-100px'},{x:'-700px', perspective: 1000, force3D: true,   ease: Linear.easeNone});	  		
  			waveReset[appid] = false;
		}
		else {
			console.log("resume");
			if(wave[appid*2-2]!=null) wave[appid*2-2].resume();
			if(wave[appid*2-1]!=null) wave[appid*2-1].resume();
		}
	} else{
		for(var i = 0; i < 6; i++){
			if(wave[i]!=null) wave[i].pause();
		}
	}
}

function circle_transition(c, b) {
	var background = $('#tv');
	var width = 0;
	var height = 0;
	var r = 0;
	setSize();

	function setSize() {
	  width = 1920;
		height = 1080;
	  r = Math.sqrt(width/2 * width/2 + height * height);
	}
	$(window).resize(setSize);

	//$(window).click(function(e) {
	  //btn.removeClass('current');
	  //$(this).addClass('current');
	  var circle = $("<div unselectable='on' id='circle'></div>");
	  var color = c;
	  background.append(circle);
	  circle.css({
	  	'z-index':100,
	    position: 'absolute',
	    'background-color': color,
	    width: 0,
	    height: 0,
	    "border-radius": "50%",
	    left: '960px',
	    top: '1080px',
	    'margin-left': 0,
	    'margin-top': 0,
	    'webkit-user-select': 'none',
	    '-moz-user-select': 'none',
	    '-ms-user-select': 'none'
	  });
	  circle.animate({
	    width: (r * 2),
	    height: (r * 2),
	   	'margin-left': -r,
	    'margin-top': -r
	  }, {
	    duration: 1000,
	    easing: "easeOutCirc",
	    queue: false,
	    complete: function() {
	/*     circle.parent().css('background-color',
	                    $(this).css('background-color'));*/
	  if(b){
	  	setTimeout(function(){
	  		circle.animate({'opacity':0},{duration:300, complete: function(){
	    	console.log($(this));
		      circle.detach();
		    }});
	  	},0);
	    }
	  }
	  });
	//});
}

function circle_transition_r() {
	var background = $('#tv');
	var width = 0;
	var height = 0;
	var r = 0;
	setSize();

	function setSize() {
	  width = $(window).width();
	  height = $(window).height();
	  r = Math.sqrt(width * width + height * height);
	}
	$(window).resize(setSize);

	//$(window).click(function(e) {
	  //btn.removeClass('current');
	  //$(this).addClass('current');
	  var circle = $('#circle');
	  
	  circle.animate({
	    width: 0,
	    height: 0,
	   	'margin-left': 0,
	    'margin-top': 0
	  }, {
	    duration: 900,
	    easing: "easeInCirc",
	    queue: false,
	    complete: function() {
	/*     circle.parent().css('background-color',
	                    $(this).css('background-color'));*/
	  
	  	setTimeout(function(){
	  		circle.animate({'opacity':0},{duration:300, complete: function(){
	    	console.log($(this));
		      circle.detach();
		    }});
	  	},0);
	  
	  }
	  });
	//});
}

/********************************************************************************************************************************

	MODULE FUNCTIONS

********************************************************************************************************************************/

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
	$.fn.opening = function(){
		var time = 100;
		$(this).each(function(index, element){
			TweenMax.delayedCall(time/1000,
				function(){
				//console.log(element);
					TweenLite.to(element, .8, {opacity:1, y:'-=100', z: 0.001, ease: Power4.easeInOut, perspective: 1000, force3D: true, });
				});
			time+=140;
		});
		if(level == 2) flag = true;
		return this;
	};
})( jQuery );

(function( $ ){
	$.fn.closing = function(){
		var time = 100;
		$(this).each(function(index, element){
			TweenMax.delayedCall(time/1000,
			function(){
				//console.log(element);
				TweenLite.to(element, .8, {opacity:0, y:'+=100', z: 0.001, ease: Power4.easeInOut, perspective: 1000, force3D: true, });
			});
			time+=80;
		});
		if(position_move>0){
			TweenLite.to($('.appbutton'),slide_speed,{left: '+='+(350*position_move), ease: Power1.easeInOut, perspective: 1000, force3D: true,   onComplete: function(){
				$backup = $('#app > .appbutton').clone();
				TweenLite.to($backup, .001, {opacity:0, y:0, z: 0.001, ease: Power4.easeInOut, perspective: 1000, force3D: true, });
			}});
			position = 0;
			position_move = 0;
			stage = 1;
		}
		else if(filter_mode == "all"){
			$backup = $('#app > .appbutton').clone();
			TweenLite.to($backup, .001, {opacity:0, y:0, z: 0.001, ease: Power4.easeInOut, perspective: 1000, force3D: true, });
		}
		return this;
	};
})( jQuery );

(function( $ ){
		$.fn.isSelected = function(s) {
			s = s || 1.6;

		if(this.hasClass('cardselected')){
			//this.css({border: '4px #FFF solid'});
			TweenLite.to(this, scale_speed, { border: '6px #FFF solid',borderTop: '6px #FFF solid',borderBottom: '6px #FFF solid',borderLeft: '6px #FFF solid',borderRight: '6px #FFF solid',  scaleX:1.6, scaleY:1.6, scaleZ:1.6, z: 0.001, zIndex: 10, perspective: 1000, force3D: true,   ease: Power4.easeInOut, perspective: 1000, onComplete:function(){
				flag = true;
			}});
		}
		else {
			TweenLite.to(this, scale_speed, { scaleX:s, scaleY:s, scaleZ:s, z: 0.001, zIndex: 10,  border: '6px #FFF solid', ease: Power4.easeInOut, perspective: 1000, force3D: true,   perspective: 1000, onComplete:function(){
				flag = true;
			}});
		}
		this.addClass('selected');
		if(mode == "navigation"){
			var id = $(this).attr('id');
			TweenLite.to($("#"+id+" > .appbutton-folder"), speed3, {opacity: 1});
			playWave(true);
  		}
		return this;
		};
})( jQuery );
(function( $ ){
		$.fn.notSelected = function(s) {
   		s = s || 1;
			if(mode == "navigation"){
				var id = $(this).attr('id');
				TweenLite.to($("#"+id+" > .appbutton-folder"), speed3, {opacity: 0});
			}
			if(this.hasClass('cardselected')){
				//this.css({border: '0px #FFF solid'});
    			TweenLite.to(this, scale_speed, { border: '0px #FFF solid',borderTop: '0px #FFF solid', borderBottom: '0px #FFF solid', borderLeft: '0px #FFF solid', borderRight: '0px #FFF solid',  scaleX:1, scaleY:1, scaleZ:1, z: 0.001, zIndex: 1, perspective: 1000, force3D: true,   ease: Power4.easeInOut, onComplete: function(){
					//flag = true;
				}});
    		}
    		else {
    			TweenLite.to(this, scale_speed, { scaleX:s, scaleY:s, scaleZ: s, z: 0.001, zIndex: 0, border: '0px #989898 solid', ease: Power4.easeInOut, perspective: 1000, force3D: true,   onComplete: function(){
					//flag = true;
				}});
    		}
    		this.removeClass('selected');
    		return this;
   		};
})( jQuery );
(function( $ ){
		$.fn.isSelected_setting = function() {
			if(this.attr('id')=="filter"){

				var $t = this;
			$t.addClass('selected');
			$('#filter.navbutton.selected .filtericon01').addClass('important-'+filter_mode);

				TweenLite.to(this, .3, {scaleX: 1.1, scaleY:1.1, scaleZ:1.1, z: 0.001, backgroundColor: 'rgba(255,255,255,1)', perspective: 1000, force3D: true,   ease: Power2.easeInOut, perspective: 1000, onComplete: function(){

			}});
			TweenMax.delayedCall(.3, function(){
				$t.removeClass('selected');

			});
				TweenLite.to(this, .3, {scaleX: 1, scaleY:1, scaleZ:1, z: 0.001,  backgroundColor: 'rgba(0,0,0,.5)', delay: .3, perspective: 1000, force3D: true,   ease: Power2.easeInOut, perspective: 1000, onComplete: function(){
					TweenLite.to($('.filter-section'), .01, {opacity: 1});
				TweenLite.to($('.filter-section'), 1, {width: '840px', perspective: 1000, force3D: true,   ease: Power2.easeOut, onComplete: function(){
					flag = true;
				}});
				$('.filter-section li').eq(filter_stage-1).delay(500).animate({  textIndent: 12 }, {
					    step: function(now,fx) {
					      $(this).css('-webkit-transform','scale('+now/10+')');
						  $(this).css('transform','scale('+now/10+')');
						  $(this).css('-moz-transform','scale('+now/10+')');

					      $(this).css('color', '#FFF');
					    },duration:filter_duration
					},'linear');
			}});
			}
			else {
      		TweenLite.to(this, .3, {scaleX: 1.1, scaleY:1.1, scaleZ:1.1, z: 0.001,  backgroundColor: 'rgba(255,255,255,1)', perspective: 1000, force3D: true,   ease: Power2.easeInOut, perspective: 1000, onComplete: function(){
						flag = true;
					}});
      		this.addClass('selected');
      		}

      		return this;
   		};
})( jQuery );
(function( $ ){
		$.fn.notSelected_setting = function() {
			var $t = this;
  		TweenLite.to($t, .2, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001,  zIndex: 1, backgroundColor: 'rgba(0,0,0,.5)', perspective: 1000, force3D: true,   ease: Power2.easeInOut, onComplete: function(){
			if($t.attr('id')=="filter"){
				$('.filter-section li').eq(filter_stage-1).animate({  textIndent: 10 }, {
					    step: function(now,fx) {
					      $(this).css('-webkit-transform','scale('+now/10+')');
						  $(this).css('transform','scale('+now/10+')');
						  $(this).css('-moz-transform','scale('+now/10+')');

					      $(this).css('color', '#CCC');
					    },duration: 200
					},'linear');
				TweenLite.to($('.filter-section'), .6, {width: '90px', perspective: 1000, force3D: true,   ease: Power2.easeOut, delay: .2, onComplete: function(){
					TweenLite.to($('.filter-section'), .1, {opacity: 0});
					flag = true;
					filter_stage = 1;
				}});
			}
			}});
  		this.removeClass('selected');
  		return this;
		};
})( jQuery );
(function( $ ){
		$.fn.isSelected_option = function(t) {
			t = t || .4;
			TweenLite.to(this, t, {backgroundColor:'rgb(255,255,255)',scaleX:1.3, scaleY:1.3, scaleZ:1.3, z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut, perspective: 1000, onComplete: function(){
				flag = true;
			}});
			this.addClass('selectedOption');

  	return this;
		};
})( jQuery );
(function( $ ){
		$.fn.notSelected_option = function(t) {
			t = t || .4;
		TweenLite.to(this, t, {backgroundColor:'rgb(96,96,96)',scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut, onComplete: function(){
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

			return $next;
		};
})( jQuery );
(function( $ ){
		$.fn.transition_opening = function(m) {

		playWave(false);
		circle_transition('rgba(0,0,0,.8)', false);
		//TweenLite.to(this, trans_speed, {opacity: .8, perspective: 1000, force3D: true,   ease: Power4.easeOut});

			if(m == "optionmode"){
    		var $current = $('.appbutton[data-number='+(parseInt(stage))+']');
    		$current.notSelected();
    		var add = 1100;

    		if($current.attr('data-type') == "main") {
    			$('#rename, #remove').css('display', 'none');
    			add = 1100;
    		}
    		else {
    			$('#rename, #remove').css('display', 'inline-block');
    			add = 1500;
    		}
		 		TweenLite.to($('#option'), .001, {zIndex:2000, ease: Power4.easeInOut});


		 		var $opt = $('#option .optbutton');
		 		var time = 0;
				$opt.each(function(index, element){
					TweenMax.delayedCall(time/1000, function(){

						TweenLite.to(element, .8, {opacity:1, y:'-=100', z:0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut, delay:.4});

					});
					time+=200;
				});

				//Set initial State
				TweenMax.delayedCall(add/1000, function(){
					$('#rearrange').isSelected_option();
				});
			}
			if(m == "addfolder"){
				TweenLite.to($('#addfolder'), .5, {opacity: 1, zIndex: 3000, delay: .5, perspective: 1000, force3D: true,   onComplete: function(){
						$(".applist").first().isSelected(1.5);
						applistposition = 1;
				}});
			}
  	return this;
		};
})( jQuery );
(function( $ ){
		$.fn.transition_closing = function(m) {
			if(m == "optionmode" || m == "rearrange"){
				TweenLite.to($('#option .optbutton'), .8, {opacity:0, y:'+=100', z: 0.001, perspective: 1000, force3D: true,   ease: Power4.easeInOut});
			}
			else if(m == "dummymode"){
				TweenLite.to($('#dummy'), .4, {opacity: 0, zIndex: -1, ease: Power4.easeIn});
			}
			else if(m == "addfolder"){
				TweenLite.to($('#addfolder-name p'), .3, {z: 0.001, perspective: 1000, force3D: true,   backgroundColor: "rgba(0,0,0,0)"});
				TweenLite.to($('#addfolder-name'), .3, {z: 0.001, perspective: 1000, force3D: true,   borderBottomColor: '#fff', borderWidth: '2px'});
				TweenLite.to($('#keyboard'), .6, {z: 0.001, perspective: 1000, force3D: true,   bottom: '-50%', ease: Power4.easeInOut});
				TweenLite.to($('#close'), .3, {opacity: 0});
				TweenLite.to($('#addfolder'), .5, {opacity: 0});
			}
		circle_transition_r();
		TweenLite.to(this, .5, {opacity: 0, perspective: 1000, force3D: true,   ease: Power4.easeIn, onComplete: function(){
				if(m == "optionmode"){
					TweenLite.to($('#option'), .001, {zIndex:-1, ease: Power4.easeInOut});
					mode = "navigation";
					if(option_stage == 3 && $('#remove').hasClass('pressed')) ;
					else {
						TweenMax.delayedCall(.5, function(){
						$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
						if($('.appbutton[data-number='+(parseInt(stage))+']').attr('data-type') == "folder"){
							TweenLite.to($('#'+$('.appbutton[data-number='+(parseInt(stage))+']').attr('id')+' > .appbutton-folder'), speed3, {opacity:1});
						}
						$('.selectedOption').notSelected_option();
						});
					}
					option_stage = 1;
				}
				else if(m == "dummymode"){					
					mode = "navigation";
					TweenMax.delayedCall(0, function(){
						$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();	
					});
				}
				else if(m == "rearrange"){
					mode = "rearrange";
					option_stage = 1;
				}
				else if(m =="addfolder"){
					
					if($('.appbutton[data-number='+(parseInt(stage))+']').attr('data-type') == "folder"){
							TweenLite.to($('#'+$('.appbutton[data-number='+(parseInt(stage))+']').attr('id')+' > .appbutton-folder'), speed3, {opacity:1});
						}
					mode = "navigation";
					$('.appbutton[data-number='+(parseInt(stage))+']').isSelected();
					level = 1;
					setting_stage = 1;
					applistposition = 1;
					folder_level = 1;
					appselected = 0;
					$('#addfolder-number--selected').text(appselected);

					if($('#addfolder-done p').hasClass('inactive')) ;
					else TweenLite.to($('#addfolder-done p'), .3, { color: "#fff"});
					TweenLite.to($('#addfolder-done'), .3, {scaleX:1, scaleY:1, scaleZ:1, z: 0.001, perspective: 1000, force3D: true,   backgroundColor:"rgba(0,0,0,.8)", onComplete: function(){
						flag = true;
					}});
					addfolder_stage = 2;
					$('#addfolder-done p').addClass('inactive').css('color', '#aaa');

				}
			}});
  	return this;
		};
})( jQuery );

$.fn.moveUp = function() {
	$.each(this, function() {
    	 $(this).after($(this).prev());
	});
};
$.fn.moveDown = function() {
	$.each(this, function() {
    	 $(this).before($(this).next());
	});
};




'use strict';
/* global Application, FilterManager, CardManager, Clock, Deck, Edit, Folder,
          KeyNavigationAdapter, MessageHandler, MozActivity, SearchBar,
          SharedUtils, SpatialNavigator, URL, XScrollable, Animations, Utils */
/* jshint nonew: false */

(function(exports) {

  const FULLSIZED_ICON = 336 * (window.devicePixelRatio || 1);
  const DEFAULT_ICON = 'url("/style/images/appic_developer.png")';
  const DEFAULT_BGCOLOR = 'rgba(0, 0, 0, 0.5)';
  const DEFAULT_BGCOLOR_ARRAY = [0, 0, 0, 0.5];
  const CARDLIST_LEFT_MARGIN = 8.4;

  /**
   * Main class of smart-home
   * @class Home
   */
  function Home() {}

  Home.prototype = {
    navigableIds:
        ['search-button', 'search-input', 'edit-button', 'settings-button',
            'filter-tab-group'],

    topElementIds: ['search-button', 'search-input', 'edit-button',
            'settings-button'],

    bottomElementIds: ['filter-tab-group', 'filter-all-button',
        'filter-tv-button', 'filter-device-button', 'filter-app-button',
        'filter-website-button'],

    isNavigable: true,
    navigableClasses: ['filter-tab', 'command-button'],
    navigableScrollable: [],
    cardScrollable: undefined,
    folderScrollable: undefined,
    _focus: undefined,
    _focusScrollable: undefined,
    _folderCard: undefined,

    filterElementIds: ['filter-all-button', 'filter-tv-button',
        'filter-device-button', 'filter-app-button', 'filter-website-button'],

    filterManager: undefined,
    cardListElem: document.getElementById('card-list'),
    folderListElem: document.getElementById('folder-list'),
    cardManager: undefined,
    editButton: document.getElementById('edit-button'),
    settingsButton: document.getElementById('settings-button'),
    searchButton: document.getElementById('search-button'),
    timeElem: document.getElementById('time'),


    init: function() {
      var that = this;

      this.initClock();

      this.cardManager = new CardManager();
      this.cardManager.init();

      this.searchBar = new SearchBar();
      this.searchBar.init(document.getElementById('search-bar'));
      this.searchBar.on('shown', this.onSearchBarShown.bind(this));
      this.searchBar.on('hidden', this.onSearchBarHidden.bind(this));

      this.cardManager.getCardList().then(function(cardList) {
        that.messageHandler = new MessageHandler();
        that.messageHandler.init(that);

        that._createCardList(cardList);
        that.cardScrollable = new XScrollable({
                frameElem: 'card-list-frame',
                listElem: 'card-list',
                itemClassName: 'app-button',
                leftMargin: CARDLIST_LEFT_MARGIN});

        that.folderScrollable = new XScrollable({
                frameElem: 'folder-list-frame',
                listElem: 'folder-list',
                itemClassName: 'app-button',
                leftMargin: CARDLIST_LEFT_MARGIN,
                scale: 0.68,
                referenceElement: that.cardScrollable});

        that.navigableScrollable = [that.cardScrollable, that.folderScrollable];
        var collection = that._getNavigateElements();

        that.spatialNavigator = new SpatialNavigator(collection);
        that.spatialNavigator.straightOnly = true;
        that.keyNavigatorAdapter = new KeyNavigationAdapter();
        that.keyNavigatorAdapter.init();
        that.keyNavigatorAdapter.on('move', that.onMove.bind(that));
        // All behaviors which no need to have multple events while holding the
        // key should use keyup.
        that.keyNavigatorAdapter.on('enter-keyup', that.onEnter.bind(that));

        that.cardListElem.addEventListener('transitionend',
                                      that.determineFolderExpand.bind(that));

        that.cardManager.on('card-inserted',
                          that.onCardInserted.bind(that, that.cardScrollable));
        that.cardManager.on('card-removed',
                          that.onCardRemoved.bind(that, that.cardScrollable));
        that.cardManager.on('card-updated', that.onCardUpdated.bind(that));

        that.spatialNavigator.on('focus', that.handleFocus.bind(that));
        that.spatialNavigator.on('unfocus', that.handleUnfocus.bind(that));
        var handleCardFocusBound = that.handleCardFocus.bind(that);
        var handleCardUnfocusBound = that.handleCardUnfocus.bind(that);
        var handleCardUnhoverBound = that.handleCardUnhover.bind(that);

        that.navigableScrollable.forEach(function(scrollable) {
          scrollable.on('focus', handleCardFocusBound);
          scrollable.on('unfocus', handleCardUnfocusBound);
          scrollable.on('unhover', handleCardUnhoverBound);
          if (scrollable.isEmpty()) {
            that.spatialNavigator.remove(scrollable);
          }
        });

        that.edit = new Edit();
        that.edit.init(that.spatialNavigator, that.cardManager,
                       that.cardScrollable, that.folderScrollable);
        that.edit.on('arrange', that.onArrangeMode.bind(that));

        that.filterManager = new FilterManager();
        that.filterManager.init({
          cardListElem: that.cardListElem,
          cardScrollable: that.cardScrollable,
          home: that,
          cardManager: that.cardManager,
        });

        // In some case, we can do action at keydown which is translated as
        // onEnter in home.js. But in button click case, we need to listen
        // keyup. So, instead keydown/keyup, we just use click event to handle
        // it. The click event is translated at smart-button when use press
        // enter on smart-button.
        that.searchButton.addEventListener('click', function() {
          that.searchBar.show();
          // hide the searchButton because searchBar has an element whose
          // appearance is the same as it.
          that.searchButton.classList.add('hidden');
        }.bind(that));

        // handle animation
        that.endBubble = null;
        document.addEventListener(
                'visibilitychange', that.onVisibilityChange.bind(that));
        // if this init function is executed after the document is set to
        // visible, the visibilitychange event may not be triggered.
        if (document.visibilityState === 'visible') {
          that.onVisibilityChange();
        }

        cardList.forEach(function(card) {
          if (card instanceof Folder) {
            card.on('card-inserted',
                        that.onCardInserted.bind(that, that.folderScrollable));
            card.on('card-removed',
                        that.onCardRemoved.bind(that, that.folderScrollable));
          }
        });

        that.spatialNavigator.focus(that.cardScrollable);
      });
    },

    onVisibilityChange: function() {
      if (document.visibilityState === 'visible') {
        Utils.holdFocusForAnimation();
        this.cardListElem.classList.remove('hidden');
        var that = this;
        Promise.all([new Promise(function(resolve) {
          that.skipBubble = Animations.doBubbleAnimation(
                                that.cardListElem, '.app-button', 100, resolve);

        }), new Promise(function(resolve) {
          if (that._folderCard) {
            that.skipFolderBubble = Animations.doBubbleAnimation(
                              that.folderListElem, '.app-button', 100, resolve);
          } else {
            resolve();
          }

        })]).then(function() {
          // Catch focus back unless there is a pin activity since callback of
          // pinning would catch the focus for us.
          if (!that.messageHandler.resumeActivity()) {
            that.spatialNavigator.focus();
          }
          that.isNavigable = true;
          that.skipBubble = null;
          that.skipFolderBubble = null;
        });
      } else {
        this.cardListElem.classList.add('hidden');
        this.messageHandler.stopActivity();
        this.isNavigable = false;
        // An user may close home app when bubbling or sliding animations are
        // still playing, and then open home app again right away. In this case,
        // the user will see the last unfinished animations. In order to solve
        // this, we have to force disable all the animations and trigger their
        // callbacks when home app is in hidden state.
        if (this.skipBubble) {
          this.skipBubble();
        }
        if (this.skipFolderBubble) {
          this.skipFolderBubble();
        }
        if (this.cardScrollable.isSliding) {
          this.cardScrollable.endSlide();
        }
        this.filterManager.resetFilter();
      }
    },

    initClock: function() {
      var that = this;
      navigator.mozL10n.ready(function() {
        that.clock = new Clock();
        that.clock.start(that.updateClock.bind(that));
        // Listen to 'moztimechange'
        window.addEventListener('moztimechange',
                                that.restartClock.bind(that));
        // Listen to 'timeformatchange'
        window.addEventListener('timeformatchange',
                                that.restartClock.bind(that));
      });
    },

    _localizeCardName: function(elem, card) {
      if (!elem || !card) {
        return;
      }

      // We should use user given name first, otherwise we use localized
      // application/deck name.
      var lang = document.documentElement.lang;
      var name = this.cardManager.resolveCardName(card, lang);
      if (name && name.raw) {
        elem.removeAttribute('data-l10n-id');
        elem.textContent = name.raw;
      } else if (name && name.id) {
        SharedUtils.localizeElement(elem, name);
      }
    },

    onCardInserted: function(scrollable, card, idx, overFolder) {
      if (card instanceof Folder) {
        card.on('card-inserted',
                this.onCardInserted.bind(this, this.folderScrollable));
        card.on('card-removed',
                this.onCardRemoved.bind(this, this.folderScrollable));
      }

      var newCardElem = this.createCardNode(card);
      var newCardButtonElem = newCardElem.firstElementChild;
      // Initial transition for new card
      newCardButtonElem.classList.add('new-card');
      newCardButtonElem.classList.add('new-card-transition');
      newCardButtonElem.addEventListener('transitionend', function onPinned() {
        newCardButtonElem.classList.remove('new-card-transition');
        newCardButtonElem.classList.remove('last-card');
        newCardButtonElem.removeEventListener('transitionend', onPinned);
      });
      // insert new card into cardScrollable
      this.isNavigable = false;
      scrollable.on('slideEnd', function() {
        newCardButtonElem.classList.remove('new-card');
        if (scrollable.nodes.indexOf(newCardElem) ===
            scrollable.nodes.length - 1) {
          newCardButtonElem.classList.add('last-card');
        }
        this.isNavigable = true;
      }.bind(this));
      if (!overFolder) {
        scrollable.insertNodeBefore(newCardElem, idx);
      } else {
        scrollable.insertNodeOver(newCardElem, idx);
      }
    },

    onCardUpdated: function(card, idx) {
      var that = this;
      var cardButton = this.cardScrollable.getItemFromNode(
                                              this.cardScrollable.getNode(idx));
      var spans =
           SharedUtils.nodeListToArray(cardButton.getElementsByTagName('span'));
      spans.forEach(function(span) {
        if (span.classList.contains('name')) {
          that._localizeCardName(span, card);
        }
      });
    },

    onCardRemoved: function(scrollable, indices) {
      indices.forEach(function(idx) {
        var elm = scrollable.getNode(idx);
        if (elm && elm.dataset.revokableURL) {
          URL.revokeObjectURL(elm.dataset.revokableURL);
        }
      }, this);
      scrollable.removeNodes(indices);
    },

    _setCardIcon: function (cardButton, card, blob, bgColor) {
       try {
        var bgUrl = URL.createObjectURL(blob);
        if (bgColor) {
          cardButton.style.backgroundColor = bgColor;
          cardButton.classList.add('fitted');
          card.backgroundType = 'fitted';
        } else {
          cardButton.classList.add('fullsized');
          card.backgroundType = 'fullsized';
        }
        cardButton.dataset.revokableURL = bgUrl;
        cardButton.style.backgroundImage = 'url("' + bgUrl + '")';
      } catch (e) {
        // If the blob is broken, we may get an exception while creating object
        // URL.
        cardButton.style.backgroundImage = DEFAULT_ICON;
        cardButton.style.backgroundColor = DEFAULT_BGCOLOR;
      }
    },

    _createWave: function(cardButton, card) {

      // deck's icon using gaia font
      var deckIcon = document.createElement('span');
      deckIcon.className = 'icon';
      deckIcon.dataset.icon = card.deckClass;

      // front wave of a deck
      var waveFront = document.createElement('div');
      waveFront.className = 'deck-wave';
      waveFront.classList.add('wave-front');
      waveFront.classList.add(card.deckClass + '-wave-front');
      waveFront.classList.add('wave-paused');

      // back wave of a deck
      var waveBack = document.createElement('div');
      waveBack.className = 'deck-wave';
      waveBack.classList.add('wave-back');
      waveBack.classList.add(card.deckClass + '-wave-back');

      cardButton.appendChild(waveBack);
      cardButton.appendChild(deckIcon);
      cardButton.appendChild(waveFront);
      cardButton.classList.add('deck-' + card.deckClass);
    },

    _fillCardIcon: function(cardButton, card) {
      var manifestURL = card.nativeApp && card.nativeApp.manifestURL;
      var that = this;
      // We have thumbnail which is created by pin
      if (card.thumbnail) {
        this._setCardIcon(cardButton, card, card.thumbnail,
                          card.backgroundColor);
        // TODO add backgroundColor??? How to do it???
      } else if (!card.cachedIconBlob) {
        // We don't have cachedIconBlob, just get icon from app
        this.cardManager.getIconBlob({
          manifestURL: manifestURL,
          entryPoint: card.entryPoint,
          // XXX: preferredSize should be determined by
          // real offsetWidth of cardThumbnailElem instead of hard-coded value
          preferredSize: FULLSIZED_ICON
        }).then(function(iconData) {
          var blob = iconData[0];
          var size = iconData[1];
          if (size >= FULLSIZED_ICON) {
            that._setCardIcon(cardButton, card, blob, null);
          } else {
            that._getIconColor(blob, function(color, err) {
              if (err) {
                that._setCardIcon(cardButton, card, blob, DEFAULT_BGCOLOR);
              } else {
                that._setCardIcon(cardButton, card, blob, 'rgba(' + color[0] +
                  ', ' + color[1] + ', ' + color[2] + ', ' + color[3] + ')');
              }
            });
          }
          card.cachedIconBlob = blob;
        });
      } else if (card.cachedIconBlob) {
        // We already have cacedIconBlob which is created by previous step.
        this._setCardIcon(cardButton, card, card.cachedIconBlob,
                          card.backgroundColor);
      }
    },

    _getIconColor: function(blob, callback) {
      var dy = 0;
      function checkColor(color, err) {
        if (err) {
          callback(null, err);
        } else if (color[3] < 255 && dy < 0.5) {
          dy += 0.25;
          SharedUtils.readColorCode(blob, 0.5, dy, checkColor);
        } else {
          callback(color[3] < 255 ? DEFAULT_BGCOLOR_ARRAY : color, err);
        }
      }

      SharedUtils.readColorCode(blob, 0.5, 0, checkColor);
    },

    onArrangeMode: function() {
      if (this._focusScrollable !== this.folderScrollable) {
        this.cleanFolderScrollable();
      }
    },

    createCardNode: function(card) {
      // card element would be created like this:
      // <div class="card">
      //   <smart-button>/* Card button */</smart-button>
      //   <section class="card-panel">
      //     <smart-button>/* Rename button */</smart-button>
      //     <smart-button>/* Delete button */</smart-button>
      //   </section>
      // </div>
      // and return DOM element
      var cardNode = document.createElement('div');
      cardNode.classList.add('card');

      var cardButton = document.createElement('smart-button');
      cardButton.setAttribute('type', 'app-button');
      cardButton.className = 'app-button';
      cardButton.dataset.cardId = card.cardId;

      var cardPanel = document.createElement('section');
      cardPanel.className = 'card-panel';

      var renameButton = document.createElement('smart-button');
      renameButton.dataset.icon = 'rename';
      renameButton.classList.add('rename-btn');

      var deleteButton = document.createElement('smart-button');
      deleteButton.dataset.icon = 'delete';
      deleteButton.classList.add('delete-btn');

      cardPanel.appendChild(renameButton);
      cardPanel.appendChild(deleteButton);

      cardNode.appendChild(cardButton);
      cardNode.appendChild(cardPanel);

      // XXX: will support Folder and other type of Card in the future
      // for now, we only create card element for Application and Deck
      if (card instanceof Application) {
        if (card.group === 'tv') {
          cardButton.classList.add('tv-channel');
          cardButton.dataset.icon = 'tv';
          cardButton.setAttribute('app-type', 'tv');
        } else {
          cardButton.setAttribute('app-type', 'app');
          this._fillCardIcon(cardButton, card);
        }
      } else if (card instanceof Deck) {
        cardButton.setAttribute('app-type', 'deck');
        if (card.group === 'website') {
          this._fillCardIcon(cardButton, card);
        } else {
          this._createWave(cardButton, card);
        }
      } else if (card instanceof Folder) {
        cardButton.setAttribute('app-type', 'folder');
        cardButton.dataset.icon = 'folder';
      }

      // For smart-button, we put card name in pseudo-element :after. However,
      // we need to localize card name and l10n library do not support
      // localizing element with children elements.
      // Instead of using :after, we create a 'span' element under smart-button
      // and put card name in it.
      var nameSpan = document.createElement('span');
      nameSpan.classList.add('name');
      this._localizeCardName(nameSpan, card);
      cardButton.appendChild(nameSpan);

      return cardNode;
    },

    _createCardList: function(cardList) {
      cardList.forEach(function(card) {
        this.cardListElem.appendChild(this.createCardNode(card));
      }.bind(this));
    },

    onMove: function(key) {
      if (!this.isNavigable || this.edit.onMove(key)) {
        return;
      }

      var focus = this.spatialNavigator.getFocusedElement();

      if (!(focus.CLASS_NAME == 'XScrollable' && focus.move(key))) {
        this.spatialNavigator.move(key);
      }
    },

    onEnter: function() {
      if (!this.isNavigable || this.edit.onEnter()) {
        return;
      }

      var focusElem = this.focusElem;

      if (focusElem === this.settingsButton) {
        this.openSettings();
      } else if (focusElem === this.editButton) {
        this.cleanFolderScrollable();
        this.edit.toggleEditMode();
        // XXX: Reset card filter when entering edit mode
        this.filterManager.resetFilter();
      } else if (focusElem &&
          this.filterElementIds.indexOf(focusElem.id) > -1) {
        this.cleanFolderScrollable();
      } else {
        // Current focus is on a card
        var cardId = focusElem.dataset.cardId;
        var card;
        if (this.focusScrollable === this.folderScrollable) {
          card = this._folderCard.findCard({cardId: cardId});
        } else {
          card = this.cardManager.findCardFromCardList({cardId: cardId});
        }

        if (card) {
          card.launch();
        }
      }
    },

    onSearchBarShown: function() {
      var hideSearchBar = function() {
        document.removeEventListener('visibilitychange', hideSearchBar);
        this.searchBar.hide();
      }.bind(this);
      document.addEventListener('visibilitychange', hideSearchBar);

      var activity = new MozActivity({
        name: 'search',
        data: { keyword: '' }
      });

      activity.onerror = hideSearchBar;
    },

    onSearchBarHidden: function() {
      this.searchButton.classList.remove('hidden');
    },

    _getNavigateElements: function() {
      var elements = [];
      this.navigableIds.forEach(function(id) {
        var elem = document.getElementById(id);
        if (elem) {
          elements.push(elem);
        }
      });
      this.navigableClasses.forEach(function(className) {
        var elems = document.getElementsByClassName(className);
        if (elems.length) {
          // Change HTMLCollection to array before concatenating
          elements = elements.concat(Array.prototype.slice.call(elems));
        }
      });
      elements = elements.concat(this.navigableScrollable);
      return elements;
    },

    handleFocus: function(elem) {
      if (elem.CLASS_NAME == 'XScrollable') {
        this._focusScrollable = elem;
        elem.focus();
        this.checkFocusedGroup();
      } else if (elem.nodeName) {
        if (this._focus) {
          this._focus.blur();
        }

        switch(elem.nodeName.toLowerCase()) {
          case 'menu-group':
            this.handleFocusMenuGroup(elem);
            break;
          default:
            elem.focus();
            this._focus = elem;
            this._focusScrollable = undefined;
            this.checkFocusedGroup(elem);
            break;
        }
      } else {
        this._focusScrollable = undefined;
      }
    },

    handleUnfocus: function(elem, nodeElem) {
      if(elem.CLASS_NAME == 'XScrollable') {
        this.handleCardUnfocus(
                elem, elem.currentItem, elem.getNodeFromItem(elem.currentItem));
      }
    },

    checkFocusedGroup: function(elem) {
      if (!this._focusedGroup) {
        return;
      }

      // close the focused group when we move focus out of this group.
      if (!elem || !this._focusedGroup.contains(elem)) {
        this._focusedGroup.close();
        this._focusedGroup = null;
      }
    },

    handleFocusMenuGroup: function(menuGroup) {
      var self = this;
      menuGroup.once('opened', function() {
        self.spatialNavigator.remove(menuGroup);
        var childElement = menuGroup.firstElementChild;
        var firstFocusable = null;
        while(childElement) {
          switch(childElement.nodeName.toLowerCase()) {
            case 'style':
            case 'script':
              break;
            default:
              firstFocusable = firstFocusable || childElement;
              self.spatialNavigator.add(childElement);
          }
          childElement = childElement.nextElementSibling;
        }
        if (firstFocusable) {
          self.spatialNavigator.focus(firstFocusable);
        }
      });
      menuGroup.once('will-close', function() {
        // Clear all opened event listener because we won't have it if opened is
        // not fired and the group is trying to close it self.
        menuGroup.off('opened');
        self.spatialNavigator.add(menuGroup);
        var childElement = menuGroup.firstElementChild;
        while(childElement) {
          switch(childElement.nodeName.toLowerCase()) {
            case 'style':
            case 'script':
              break;
            default:
              self.spatialNavigator.remove(childElement);
          }
          childElement = childElement.nextElementSibling;
        }
      });
      this.checkFocusedGroup(menuGroup);
      this._focusedGroup = menuGroup;
      menuGroup.open();
    },

    handleCardFocus: function(scrollable, itemElem, nodeElem) {
      this._focus = itemElem;

      if (this.edit.mode === 'edit') {
        this.edit.handleCardFocus(scrollable, itemElem, nodeElem);
      }
      itemElem.focus();
      nodeElem.classList.add('focused');
      if(scrollable === this.cardScrollable && this._folderCard &&
                        itemElem.dataset.cardId !== this._folderCard.cardId &&
                        !this.cardScrollable.isHovering) {
        this.cleanFolderScrollable();
      }
    },

    cleanFolderScrollable: function(doNotChangeFocus) {
      if (this._focusScrollable === this.folderScrollable &&
          !doNotChangeFocus) {
        this.spatialNavigator.focus(this.cardScrollable);
      }
      this.spatialNavigator.remove(this.folderScrollable);
      this.folderScrollable.clean();
      this._folderCard = undefined;
      this.edit.isFolderReady = false;
      this.cardScrollable.setColspanOnFocus(0);
    },

    handleCardUnfocus: function(scrollable, itemElem, nodeElem) {
      // Fix null error when the last card in a folder is removed.
      if (nodeElem) {
        nodeElem.classList.remove('focused');
      }
    },

    handleCardUnhover: function(scrollable, itemElem, nodeElem) {
      this.cleanFolderScrollable();
    },

    determineFolderExpand: function(evt) {
      // Folder expansion is performed on only when user moves cursor onto a
      // folder or hover a folder in edit mode and it finished its focus
      // transition.
      if (this.focusScrollable === this.cardScrollable &&
        evt.originalTarget.classList.contains('app-button') &&
        (!this._folderCard ||
          this._folderCard.cardId !== evt.originalTarget.dataset.cardId) &&
        (evt.originalTarget.classList.contains('focused') &&
          // Listen to 'outline-width' rather than 'transform' here since it
          // also applies to edit mode when user moves from panel button back
          // to card.
          evt.propertyName === 'outline-width' &&
          document.getElementById('main-section').dataset.mode !== 'arrange' ||
          // Folder needs to be expanded when hovered as well.
          evt.originalTarget.classList.contains('hovered'))) {
        this.buildFolderList(evt.originalTarget);
      }
    },

    buildFolderList: function(target) {
      var cardId = target.dataset.cardId;
      var card = this.cardManager.findCardFromCardList({cardId: cardId});
      if (!(card instanceof Folder)) {
        return;
      }

      this._folderCard = card;
      var folderList = this._folderCard.getCardList();

      if (folderList.length === 0) {
        this.edit.isFolderReady = true;
        // Needs to disable the folder-list animation right away to
        // prevent it from affecting the new-card into folder animation.
        this.folderListElem.style.transition = 'none';
        return;
      }

      // Build folder list
      folderList.forEach(function(card) {
        this.folderScrollable.addNode(this.createCardNode(card));
      }, this);

      var isFirstFrame = true;
      var initFolderAnimation = function() {
        if (isFirstFrame) {
          isFirstFrame = false;
          // At first frame, we call setReferenceElement to move folder list
          // right under folder card. Transition should be replaced by 'none'
          // since we don't need to show this process as animation to user.
          this.folderListElem.style.transition = 'none';
          this.folderScrollable.realignToReferenceElement();
          this.skipFolderBubble = Animations.doBubbleAnimation(
                        this.folderListElem, '.app-button', 100, function() {
              this.spatialNavigator.add(this.folderScrollable);
              this.edit.isFolderReady = true;
              this.skipFolderBubble = undefined;
            }.bind(this));

          window.requestAnimationFrame(initFolderAnimation);
        } else {
          // 2nd frame, recover original transition.
          this.folderListElem.style.transition = '';
        }
      }.bind(this);
      window.requestAnimationFrame(initFolderAnimation);
    },

    openSettings: function() {
      /* jshint nonew: false */
      new MozActivity({
        name: 'configure',
        data: {}
      });
    },

    updateClock: function() {
      var now = new Date();
      var _ = navigator.mozL10n.get;
      var use12Hour = window.navigator.mozHour12;

      var f = new navigator.mozL10n.DateTimeFormat();

      var timeFormat = use12Hour ? _('shortTimeFormat12') :
                                   _('shortTimeFormat24');
      // remove AM/PM and we use our owned style to show it.
      timeFormat = timeFormat.replace('%p', '').trim();
      var formatted = f.localeFormat(now, timeFormat);

      this.timeElem.innerHTML = formatted;
      this.timeElem.dataset.ampm = use12Hour ? f.localeFormat(now, '%p') : '';
    },

    restartClock: function() {
      navigator.mozL10n.ready((function() {
        // restart clcok
        this.clock.stop();
        this.clock.start(this.updateClock.bind(this));
      }).bind(this));
    },

    get focusElem() {
      return this._focus;
    },

    get focusScrollable() {
      return this._focusScrollable;
    }
  };

  exports.Home = Home;
}(window));


'use strict';
/* global Home */
window.home = new Home();
window.home.init();
