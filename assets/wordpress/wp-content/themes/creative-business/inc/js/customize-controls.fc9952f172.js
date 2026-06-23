jQuery(document).ready(function ($) {
    /* Move widgets to their respective sections */
    // wp.customize.section('sidebar-widgets-services').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-services').priority('50');

    // wp.customize.section('sidebar-widgets-about').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-about').priority('55');

    // wp.customize.section('sidebar-widgets-choose-us').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-choose-us').priority('60');

    // wp.customize.section('sidebar-widgets-client').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-client').priority('65');

    // wp.customize.section('sidebar-widgets-testimonial').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-testimonial').priority('70');

    // wp.customize.section('sidebar-widgets-stats').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-stats').priority('75');

    // wp.customize.section('sidebar-widgets-team').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-team').priority('80');

    // wp.customize.section('blog_section').panel('frontpage_panel');
    // wp.customize.section('blog_section').priority('85');

    // wp.customize.section('portfolio_section').panel('frontpage_panel');
    // wp.customize.section('portfolio_section').priority('90');

    // wp.customize.section('sidebar-widgets-cta').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-cta').priority('95');

    // wp.customize.section('sidebar-widgets-faq').panel('frontpage_panel');
    // wp.customize.section('sidebar-widgets-faq').priority('100');

    $(window).scroll(function () {
        $('.mega-toggle-on').removeClass('.mega-toggle-on');
    });

    $('.searchform').hover(function () {
        $(this).addClass("hover");
        $(this).find("input").focus().select();
    }, function () {
        $(this).removeClass("hover");
    });


    $('.banner .banner-text .btn-holder .btn-free-inquiry').hover(function () {
        $('.banner .banner-text .btn-holder .btn-view-service').removeClass('hover');
        $(this).addClass("hover");
    }, function () {

    });

    $('.banner .banner-text .btn-holder .btn-view-service').hover(function () {
        $('.banner .banner-text .btn-holder .btn-free-inquiry').removeClass('hover');
        $(this).addClass("hover");
    }, function () {
        $('.banner .banner-text .btn-holder .btn-free-inquiry').addClass('hover');
        $(this).removeClass("hover");
    });

    $('#mega-menu-item-48 > a').attr('href', 'javascript:void(0)');//product;
    $('#mega-menu-item-261 > a').attr('href', 'javascript:void(0)');//customer support
    $('#mega-menu-item-261 > ul a').attr('target', '_blank');

    $('.questions .question').click(function () {
        $(this).toggleClass('fold');
    })

    var slide_params = {
        autoplay: false,
        dots: true,
        infinite: true,
        speed: 400,
        arrows: false,
        slidesToShow: 1,
        adaptiveHeight: true
    };
    $('.slides-1').slick(slide_params);
    $('.slides-2').slick(slide_params);

    $('.serviceflow .step-btn-wrapper').hover(function () {
        $('.serviceflow .step-btn-wrapper').removeClass('active');
        $(this).addClass('active');
    })
});