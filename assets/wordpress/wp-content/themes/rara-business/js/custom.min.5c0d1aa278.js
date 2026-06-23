/*! rara-business  2020-05-13 11:45:27 AM */

jQuery(document).ready(function (t) {
	rb_localize_data.animation && (new WOW).init(); var i, e, a = t(window).width(); t(".skills").addClass("active"), t(".skills .skill .skill-bar span").each(function () { t(this).animate({ width: t(this).parent().attr("data-bar") + "%" }, 1e3), t(this).append("<b>" + t(this).parent().attr("data-bar") + "%</b>") }), setTimeout(function () { t(".skills .skill .skill-bar span b").animate({ opacity: "1" }, 1e3) }, 2e3), a < 1025 && (t(".main-navigation ul li.menu-item-has-children").append('<span class="submenu-toggle"><i class="fa fa-angle-down"></i></span>'), t(".main-navigation ul li .submenu-toggle").click(function () { t(this).prev().slideToggle(), t(this).toggleClass("active") }), t("#primary-toggle-button").click(function () { t(".responsive-menu-holder").slideToggle(), t(".site-header .header-t").toggleClass("bg-color"), t(this).toggleClass("close") })), t(".widget_rrtc_description_widget").length && t(".description").each(function () { new PerfectScrollbar(t(this)[0]) }), 0 < t(".filter-grid div.element-item").length && (i = "1" != rb_localize_data.rtl, e = t(".filter-grid").imagesLoaded(function () { e.isotope({ isOriginLeft: i }), t(".filter-button-group").on("click", "button", function () { t(".filter-button-group button").removeClass("is-checked"), t(this).addClass("is-checked"); var i = t(this).attr("data-filter"); e.isotope({ filter: i }) }) })), 1024 < t(window).width() && t(".main-navigation ul li a").focus(function () { t(this).parents("li").addClass("hover") }).blur(function () { t(this).parents("li").removeClass("hover") })
	t(window).scroll(function () {
		setTimeout(function () { t('.mega-toggle-on').removeClass('mega-toggle-on') }, 160);
	});

	var isIOS = /(iPhone|iPod|iPad)/i.test(navigator.platform);

	if (isIOS) {
		t('body').addClass('ios');
	}
});