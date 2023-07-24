console.log(navigator.userAgent);

$(function() {

    var hourly_data;
    var weekly_data;


    $('.slider').slick({
      infinite: false,
      dots: false,
      arrows: false,
      touchThreshold: 8,
      edgeFriction: 0
    });

    var last_slide = 0;
    $('.slider').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
      if (nextSlide != last_slide)
      {
        if (nextSlide == 0)
        {
          showHourly();
        }
        else
        {
          showWeek();
        }
      }
    });

    $('.slider').on('afterChange', function(event, slick, currentSlide) {
      if (currentSlide != last_slide)
      {
        if (currentSlide == 0)
        {
          hideWeek();
        }
        else
        {
          hideHourly();
        }
      }

      last_slide = currentSlide;
    });

    function initHourly() {
      for (i=0; i<24; i++)
      {
        $('.hourly').append('<div class="hour"><div class="time"></div><div class="bar"></div><div class="temperature"></div></div>');
      }
      if (!hourly_data)
        getHourlyData();
      else
        showHourly();
    }

    function getHourlyData() {
     $.getJSON(hourly_url, function (data) {
       hourly_data = data;
       if (weekly_data) showHourly(); /* wait for all data before showing */
     });
    }

    function showHourly() {
      $('.hourly').scrollTop(0);

      data = hourly_data;

      var items = [];

      // Set up min/maxes
      var max_temp = -100;
      var min_temp = 1000;
      $.each(data[0].pageFunctionResult, function(index, item) {

        if (item.humidex)
          item.temperature = item.humidex;

        if (parseInt(item.temperature) >= max_temp) {
          max_temp = parseInt(item.temperature);
        }
        if (parseInt(item.temperature) <= min_temp) {
          min_temp = parseInt(item.temperature);
        }
      });

      var last_temp = -100;
      // Set up display elements
      $.each(data[0].pageFunctionResult, function(index, item) {

        var element = $('.hour:eq(' + index + ')');

        var time_ampm = '<sup>am</sup>';
        var time_hour = parseInt(item.hour.replace(':00',''));
        if (time_hour == 8 || time_hour == 16)
          element.addClass('divider');
        if (time_hour >= 12) {
          time_hour -= 12;
          time_ampm = '<sup>pm</sup>';
        }
        if (time_hour == 0)
          time_hour = 12;

        if (item.icon == 28) item.icon = 12; // Drizzle == rain
        if (item.icon == 24) item.icon = 10; // Mist == clouds

        element.addClass('style' + item.icon);
        element.addClass('lop-' + item.lop.toLowerCase());
        element.find('.time').html(time_hour + time_ampm);
        if (item.temperature != last_temp)
          element.find('.temperature').data('animate-to',item.temperature);
        last_temp = item.temperature;

        var o = element;
        var bar_size = ((item.temperature-min_temp) / (max_temp-min_temp) * 70 + 15);
        window.setTimeout(function () {
          o.find('.bar').css('width', bar_size + '%');
          o.addClass('loaded');
          animateNumbers(o.find('.temperature'), true);
        }, index * waterfall_delay);
      });

      if (weekly_data)
      {
        // Current conditions come from weekly data
        item = weekly_data[0].pageFunctionResult[0];
        console.log(item);
        $('.now').addClass('loaded');
        if (item.icon == 28) item.icon = 12; // Drizzle == rain
        if (item.icon == 24) item.icon = 10; // Mist == clouds
        $('.now .icon').addClass('style' + item.icon);
        $('.now .temperature').data('animate-to',item.high);
        if (item.details != '') /* Humidex */
          $('.now .temperature').data('animate-to',item.details);
        animateNumbers($('.now .temperature'), true);
      }
    }
    function hideHourly() {
      $('.slide1 .bar').css('width','0%');
      $('.slide1 .temperature').each (function() {
        $(this).html('').data('animate-interval',100);
      });
      $('.slide1 .loaded').removeClass('loaded');
    }

    function initWeek() {
      for (i=0; i<6; i++)
      {
        $('.days').append('<div class="day"><div class="label"></div><div class="icon"><div class="moon"></div><div class="sun"><div class="ray"></div><div class="ray"></div><div class="ray"></div><div class="ray"></div><div class="ray"></div><div class="ray"></div><div class="ray"></div><div class="ray"></div></div><div class="cloud sidecloud-left"></div><div class="snow snow-sidecloud-left"><div class="snowflake-row"><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div></div><div class="snowflake-row"><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div></div></div><div class="cloud sidecloud-right"></div><div class="rain rain-sidecloud-right"></div><div class="cloud largecloud"></div><div class="rain rain-largecloud"></div><div class="snow snow-largecloud"><div class="snowflake-row"><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div></div><div class="snowflake-row"><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div><div class="snowflake"></div></div></div><div class="cloud backcloud"></div></div><div class="highlow"><div class="high" data-animate-to="24"></div><div class="low" data-animate-to="17"></div></div><div class="details"><div><div>Mostly sunny.</div></div></div></div>')
      }
      if (!weekly_data)
        getWeekData();
    }

    function getWeekData() {
      $.getJSON(weekly_url, function (data) {
	    
         weekly_data = data;
		 if (hourly_data) showHourly(); /* wait for all data before showing */
      });
    }

    function showWeek() {
      data = weekly_data;
      console.log(data);
      $.each(data[0].pageFunctionResult, function(index, item) {
        if (index > 0)
        {
          var element = $('.day:eq(' + (index-1) + ')');

          if (index < 5 && (item.day == 'Fri' || item.day == 'Sun'))
            element.addClass('divider')

        console.log(item);
          element.find('.label').text(item.day);
          element.find('.high').data('animate-to',item.high);
          element.find('.low').data('animate-to',item.low);
          element.find('.details > div > div').text(item.details);
          element.find('.icon').addClass('style' + item.icon);

          var o = element;
          window.setTimeout(function () {
            o.addClass('loaded');
            animateNumbers(o.find('.high'), false);
            animateNumbers(o.find('.low'), false);
          }, index * (waterfall_delay*2));
        }
      });
    }

    function hideWeek() {
      $('.slide2 *[data-animate-to]').each (function() {
        $(this).html('').data('animate-interval',100);
      });
      $('.slide2 .loaded').removeClass('loaded');
    }

    function animateNumbers(element, has_degrees=false) {
      element=$(element);

      degrees_str = '';
      if (has_degrees)
        degrees_str = '&deg;';

      if (!element.data('animate-to')) return false;
      var animate_to = parseInt(element.data('animate-to'));

      var animate_interval = 100;
      if (element.data('animate-interval')) animate_interval = element.data('animate-interval');

      var animate_val = parseInt(element.html().replace('&deg;',''));
      if (element.html() == '') animate_val = animate_to - 16;

      animate_val++;
      element.html(animate_val + degrees_str);

      current_time = 1-((animate_to - animate_val) / 15);
      start_val = 0;
      change_amount = 150;
      duration = 1;
      animate_interval = easeInQuad(current_time, start_val, change_amount, duration);

      if (animate_val < animate_to)
        setTimeout(function() { animateNumbers(element, has_degrees) }, animate_interval);
    }

    var waterfall_delay = 50;

    initHourly();
    initWeek();

  });

 function easeInQuad(t, b, c, d) {
  t /= d;
  return c*t*t + b;
};

/* Prevent overscroll */
var selScrollable = '.scrollable';
// Uses document because document will be topmost level in bubbling
$(document).on('touchmove',function(e){
  e.preventDefault();
});
// Uses body because jQuery on events are called off of the element they are
// added to, so bubbling would not work if we used document instead.
$('body').on('touchstart', selScrollable, function(e) {
  if (e.currentTarget.scrollTop === 0) {
    e.currentTarget.scrollTop = 1;
  } else if (e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.offsetHeight) {
    e.currentTarget.scrollTop -= 1;
  }
});
// Stops preventDefault from being called on document if it sees a scrollable div
// Stops preventDefault from being called on document if it sees a scrollable div
$('body').on('touchmove', selScrollable, function(e) {
  e.stopPropagation();
});
