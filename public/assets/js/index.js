let baseurl = "/",
    loanamt, year, roi, chatarray = [];
var currentyear = (new Date).getFullYear(),
    months = new Array("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");

function chartrender(x, y) {
    Highcharts.chart("container", {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: !1,
            type: "pie"
        },
        title: {
            text: "EMI CALCULATOR"
        },
        tooltip: {
            pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>"
        },
        plotOptions: {
            pie: {
                allowPointSelect: !0,
                cursor: "pointer",
                dataLabels: {
                    enabled: !0,
                    format: "<b>{point.name}</b>: {point.percentage:.1f} %",
                    style: {
                        color: Highcharts.theme && Highcharts.theme.contrastTextColor || "black"
                    }
                }
            }
        },
        series: [{
            name: "Brands",
            colorByPoint: !0,
            data: chatarray
        }]
    }), $(".highcharts-credits,.highcharts-button-symbol").css("display", "none")
}

function emicalculation(loanamt, year, roi) {
    var url;
    let tablerow = "";
    url = `${baseurl}emi?loanAmount=${loanamt}&rateOfInterest=${roi}&numberOfMonths=${year}`, $.ajax({
        type: "GET",
        url: url,
        beforeSend: function () { }
    }).done(data => {
        console.log(data)
        let monthlyemival=0,totalinterestval=0;
       

        let dataArr = data.Response;
        $("#emitable").empty();
        for (let item of dataArr) {
            monthlyemival = item.EMI
            totalinterestval += (+item.Interest)
            $("#emitable").append(`<tr animated zoomIn"><td></td>\n                    <td>${item.MonthNo}</td>\n                    <td>${item.BeginBalance}</td>\n                    <td>${item.EMI}</td>\n                    <td>${item.Principal}</td>\n                    <td>${item.Interest}</td>\n                    <td>${item.EndBalance}</td>\n                  </tr>`)
            

        }
        

         $("#monthlyemival").text(monthlyemival), $("#totalinterestval").text(totalinterestval), (chatarray = []).push({
            name: "Interest",
            y: totalinterestval,
            sliced: !0,
            selected: !0
        }, {
                name: "Loan",
                y: +loanamt
            }), chartrender();


        plusiconchange()
    }).catch(e => {
        alert(`URL : ${url}\nStatusCode:${e.status}\nDescription:${e.statusText}`)
    })
}

function plusiconchange() {
    $(".plusicon").each(function () {
        $(this).parent().parent().click(function () {
            $(this).parent().find(".collapse").removeClass("in"), $(".plusicon").html("+"), "+" === $(this).find(".plusicon").html() ? $(this).find(".plusicon").html("-") : $(this).find(".plusicon").html("+")
        })
    })
}

$(document).ready(function () {
    loanamt = $("#loanamt").val(), year = $("#year").val(), roi = $("#roi").val(), $("#loanamtval").text(loanamt), $("#yearval").text(year), $("#roival").text(roi), $("#loanamt").on("change input", function () {
        $("#loanamtval").text($("#loanamt").val()), emicalculation(loanamt = $("#loanamt").val(), year, roi)
    }), $("#year").on("change input", function () {
        $("#yearval").text($("#year").val()), year = $("#year").val(), emicalculation(loanamt, year, roi)
    }), $("#roi").on("change input", function () {
        $("#roival").text($("#roi").val()), roi = $("#roi").val(), emicalculation(loanamt, year, roi)
    }), emicalculation(loanamt, year, roi), chatarray.push({
        name: "Interest",
        y: 42900,
        sliced: !0,
        selected: !0
    }, {
            name: "Loan",
            y: 26e4
        }), chartrender()
}), $(document).ready(function () {
    $("#sidebar").mCustomScrollbar({
        theme: "minimal"
    }), $("#sidebarCollapse").on("click", function () {
        $("#sidebar, #content").toggleClass("active"), $(".collapse.in").toggleClass("in"), $("a[aria-expanded=true]").attr("aria-expanded", "false")
    })
});