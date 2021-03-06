
var Parallax = {
	selector: '.js-hero-bg',
	covers: $([]),
	amount: 0,
	initialized: false,
	start: 0,
	stop: 0,

	initialize: function () {
		var that = this;

		// if this is a touch device initialize the slider and skip the complicated part
		if ((Modernizr.touch || is_ie) && !this.initialized) {

			$('.hero').each(function (i, hero) {

				var $hero 	= $(hero),
					$cover 	= $hero.children('.hero__bg'),
					$image 	= $cover.find('img').not('.gmap img');

				$hero.find('.hero__bg').show();

				if ( ! $image.length ) {
					$image = $cover.children('picture').children('img');
				}

				if ( $image.length ) {

					var imageWidth 	= $image.css('width', 'auto').outerWidth(),
						imageHeight = $image.outerHeight(),
						heroHeight 	= $hero.outerHeight(),
						scaleX		= windowWidth / imageWidth;
						scaleY		= windowHeight / imageHeight;
						scale		= Math.max(scaleX, scaleY);
						newWidth	= parseInt(imageWidth * scale);

					$image.css('width', newWidth);
				}

				if (is_ie) {
					$hero.css('min-height', windowHeight);
				}

				gmapInit($hero);

				// $hero.find('.hero__slider').data('imagescale', 'fill');
				royalSliderInit($hero);
			});

			return;
		}

		this.stop 			= documentHeight - windowHeight;
		this.amount 		= $body.data('parallax-speed');
		this.initialized 	= true;

		// clean up
		$('.covers').empty();

		$('.js-hero-bg').each(function (i, cover) {

			// grab all the variables we need
			var $cover 		= $(cover),
				opacity		= $cover.css('opacity'),
				$target		= $cover.children().not('span'),
				$image		= $target.filter('img'),
				$slider		= $target.not('img'),
				$clone			= $cover.clone(),
				$cloneTarget 	= $clone.children().not('span'),
				$cloneImage		= $cloneTarget.filter('img'),
				$cloneSlider 	= $cloneTarget.not('img'),
				imageWidth	= $image.outerWidth(),
				imageHeight = $image.outerHeight(),
				$hero 		= $cover.parent(),
				heroHeight	= $hero.outerHeight(),
				heroOffset	= $hero.offset(),
				adminBar 	= parseInt($html.css('marginTop')),
				amount		= that.amount,

			// we may need to scale the image up or down
			// so we need to find the max scale of both X and Y axis
				scaleX,
				scaleY,
				scale,
				newWidth,
				distance,
				speeds		= {
					static: 0,
					slow: 	0.25,
					medium: 0.5,
					fast:	0.75,
					fixed:	1
				};

			$cover.removeAttr('style');
			$clone.data('source', $cover).appendTo('.covers').show();
			$clone.css('height', heroHeight);

			// let's see if the user wants different speed for different whateva'
			if (typeof parallax_speeds !== "undefined") {
				$.each(speeds, function(speed, value) {
					if (typeof parallax_speeds[speed] !== "undefined") {
						if ($hero.is(parallax_speeds[speed])) {
							amount = value;
						}
					}
				});
			}

            scaleX      = windowWidth / imageWidth;
            scaleY      = (heroHeight + (windowHeight - heroHeight) * amount) / imageHeight;
            scale       = Math.max(scaleX, scaleY);
            newWidth    = parseInt(imageWidth * scale);
            distance    = (windowHeight - heroHeight) * amount;

			// set the new width, the image should have height: auto to scale properly
			$cloneImage.css('width', newWidth);

			// if there's a slider we are working with we may have to set the height
			$cloneSlider.css('height', heroHeight + distance);

			// align the clone to its surrogate
			// we use TweenMax cause it'll take care of the vendor prefixes
			TweenMax.to($clone, 0, { y: heroOffset.top - adminBar });

			// prepare image / slider timeline
			var parallax = {
					start:		heroOffset.top - windowHeight - distance,
					end:		heroOffset.top + heroHeight + distance,
					timeline:	new TimelineMax({ paused: true })
				},
			// the container timeline
				parallax2 = {
					start: 		0,
					end:		documentHeight,
					timeline:	new TimelineMax({ paused: true })
				};

			// move the image for a parallax effect
			parallax.timeline.fromTo($cloneTarget, 1, {
				y: '-=' + (windowHeight + heroHeight + 2 * distance) * amount / 2
			}, {
				y: '+=' + (windowHeight + heroHeight + 2 * distance) * amount,
				ease: Linear.easeNone,
				force3D: true
			});

			parallax.timeline.fromTo($cloneSlider.find('.hero__content, .hero__caption'), 1, {
				y: '+=' + windowHeight * amount
			}, {
				y: '-=' + windowHeight * amount * 2,
				ease: Linear.easeNone,
				force3D: true
			}, '-=1');

			// move the container to match scrolling
			parallax2.timeline.fromTo($clone, 1, {
				y: heroOffset.top
			}, {
				y: heroOffset.top - documentHeight,
				ease: Linear.easeNone,
				force3D: true
			});

			// set the parallax info as data attributes on the clone to be used on update
			$clone
				.data('parallax', parallax)
				.data('parallax2', parallax2);

			// update progress on the timelines to match current scroll position
			that.update();

			// or the slider
			royalSliderInit($clone);
			gmapInit($clone);

			if (that.initialized) {
				TweenMax.to($clone, .3, {'opacity': 1});
			}

		});

	},

	update: function () {

		if (Modernizr.touch || is_ie || latestKnownScrollY > this.stop || latestKnownScrollY < this.start) {
			return;
		}

		$('.covers .js-hero-bg').each(function (i, cover) {
			var $cover 		= $(cover),
				parallax 	= $cover.data('parallax'),
				parallax2 	= $cover.data('parallax2'),
				progress 	= (latestKnownScrollY - parallax.start) / (parallax.end - parallax.start),
				progress2 	= (latestKnownScrollY - parallax2.start) / (parallax2.end - parallax2.start);

			progress = 0 > progress ? 0 : progress;
			progress = 1 < progress ? 1 : progress;

			progress2 = 0 > progress2 ? 0 : progress2;
			progress2 = 1 < progress2 ? 1 : progress2;

			parallax.timeline.progress(progress);
			parallax2.timeline.progress(progress2);
		});

	}
};