import {scaleQuantize} from "d3-scale";

const LOCAL_DATASETS = false

let API_URL
let API_COUNTY

if(LOCAL_DATASETS){
    API_URL = './zip_dataset.geojson'

    API_COUNTY = './county_dataset.geojson'
}
else{
    API_URL = 'https://opendata.arcgis.com/datasets/854d7e48e3dc451aa93b9daf82789089_0.geojson'

    API_COUNTY = 'https://opendata.arcgis.com/datasets/1fefbb8df33948cba664d0a9cb71b8c9_0.geojson'
}

export {API_URL}

export {API_COUNTY}


export const colorScale = scaleQuantize()
    .domain([1, 45])
    .range([
        "#ffedea",

        "#f8c3a0",

        "#e5974f",
        "#d27d32",

        "#d25d30",
        "#ab3a1e",

        "#ac2b16",

        "#6b0f00",
        "#6b0f00",

        "#5b0e01",

        "#350701",
        "#350701",

        // "#ffedea",
        // "#ffcec5",
        // "#ffad9f",
        // "#ff8a75",
        // "#ff5533",
        // // "#e2492d",
        // // "#be3d26",
        // "#8c2817",
        // "#6b0f00",
        // "#350701",
    ]);


export const associatedPopulationsObj = {
 92037: 41031,
     92121: 4529,
     92122: 47550,
     92117: 55256,
     92111: 46475,
     92123: 26823,
     92124: 31814,
     92120: 31335,
     92109: 47844,
     92108: 18858,
     92107: 28052,
     92110: 26381,
     92103: 32946,
     92116: 33114,
     92115: 66669,
     92182: 606,
     92106: 18424,
     92140: 3435,
     92104: 46945,
     92105: 73428,
     92101: 38725,
     92102: 44545,
     92113: 53688,
     92136: 10699,

}
export const zipCodeNames = {
 92037: "La Jolla",
     92121: "Sorrento Valley",
     92122: "UTC",
     92117: "North Clairemont",
     92111: "East Clairemont",
     92123: "Kearny Mesa",
     92124: "Tierra Santa",
     92120: "Del Cerro",
     92109: "Pacific Beach",
     92108: "Mission Valley",
     92107: "Ocean Beach",
     92110: "Bay Park",
     92103: "Hillcrest",
     92116: "Normal Heights",
     92115: "SDSU Area",
     92182: "SDSU (on-campus)",
     92106: "Point Loma",
     92140: "Loma Portal",
     92104: "North Park",
     92105: "City Heights",
     92101: "Downtown / Little Italy",
     92102: "South Park / Golden Hill",
     92113: "Logan Heights",
     92136: "Naval Base",

     91910: "Chula Vista (west)",
     91911: "Chula Vista (south)",
     91913: "Chula Vista (otay ranch)"

}
export const zipCodeCoordinates = {
 92037: {lat: 32.8283259, long: -117.255854, x: -60, y: -20},
 92121: {lat: 32.8981142, long: -117.2029363, x: 50, y: 5},
 92122: {lat: 32.8563846, long: -117.2029363, x:-33, y: -42},
 92117: {lat: 32.8250767, long: -117.2029363, x: 90, y: -55},
 92111: {lat: 32.8256427, long: -117.1558867, x:30, y: -53},
 92123: {lat: 32.8102534, long: -117.1323579, x: 15, y: -69},
 92124: {lat: 32.8250787, long: -117.091176, x: 70, y: -40},
 92120: {lat: 32.7926264, long: -117.0735241, x: 60, y: -20},
 92109: {lat: 32.7920948, long: -117.2323367, x: -55, y: -20},
 92108: {lat: 32.7742488, long: -117.1411815},  // mission valley
 92107: {lat: 32.7409782, long: -117.2499749, x: -25, y: -10},
 92110: {lat: 32.7657318, long: -117.199996, x: -100, y: -20},
 92103: {lat: 32.749789, long: -117.1676501, x: -70, y: 80}, // hillcrest
 92116: {lat: 32.7679176, long: -117.1235339, x:130, y: 10},
 92115: {lat: 32.7612759, long: -117.0735241, x: 60, y: 30}, // sdsu area
 92182: {lat: 32.7759882, long: -117.072053, x: 80, y: 30},
 92106: {lat: 32.7090984, long: -117.241156, x: -60, y: 40},
 92140: {lat: 32.7407191, long: -117.2036713, x: -90, y: 20},
 92104: {lat: 32.7398671, long: -117.1205925, x: 140, y: -60},
 92105: {lat: 32.7348953, long: -117.0970596, x: 40, y: 20},  // city heights
 92101: {lat: 32.7269669, long: -117.1647094, x: -50, y: 80},
 92102: {lat: 32.7162223, long: -117.1323579, x: 80, y: 20},

 92113: {lat: 32.6980553, long: -117.1205925, x: 50, y: 30},

 92136: {lat: 32.6833364, long: -117.1220632, x: 1, y: 30},
}

export const chulaVistaPopulations = {
 91910: 77369,
     91911: 85259,
     91913: 50070,
}



// Define holiday sections in MapChartHeatmap
export const stripLines = [
    {
     startValue: new Date("2020/06/11"),
     endValue: new Date("2020/06/30"),
     label: "Bars open",
     labelFontSize: 22,
     labelAlign: "far",
     opacity: .8,
     color:"transparent",
     labelFontColor: "#f44336",
     showOnTop: true,
     labelBackgroundColor: "white",
     labelMaxWidth: 500,
    },{
     startValue: new Date("2020/08/20"),
     endValue: new Date("2020/09/08"),
     label: "SDSU begins",
     labelFontSize: 22,
     labelAlign: "far",
     opacity: .6,
     color:"transparent",
     labelFontColor: "#f44336",
     showOnTop: true,
     labelBackgroundColor: "white",
     labelMaxWidth: 1000,

    },{
     startValue: new Date("2020/10/30"),
     endValue: new Date("2020/11/6"),
     label: "Halloween",
     labelFontSize: 22,
     labelAlign: "far",
     opacity: .6,
     color:"transparent",
     labelFontColor: "#f44336",
     showOnTop: true,
     labelBackgroundColor: "white",
     labelMaxWidth: 1000,

    },{
     startValue: new Date("2020/11/23"),
     endValue: new Date("2020/12/02"),
     label: "Thanksgiving",
     labelFontSize: 22,
     labelAlign: "far",
     opacity: .4,
     color:"transparent",
     labelFontColor: "#f44336",
     showOnTop: true,
     labelBackgroundColor: "white",
     labelMaxWidth: 1000,
   },{
    startValue: new Date("2020/12/18"),
    endValue: new Date("2020/12/28"),
    label: "Christmas",
    labelFontSize: 22,
    labelAlign: "near",
    opacity: .4,
    color:"transparent",
    labelFontColor: "#f44336",
    showOnTop: true,
    labelBackgroundColor: "white",
    labelMaxWidth: 1000,
    },{
    startValue: new Date("2021/02/06"),
    endValue: new Date("2021/02/08"),
    label: "Super Bowl",
    labelFontSize: 22,
    labelAlign: "far",
    opacity: .4,
    color:"transparent",
    labelFontColor: "#f44336",
    showOnTop: true,
    labelBackgroundColor: "white",
    labelMaxWidth: 1000,
    }
]


// // Used in ResultsComponent
// export let optionsWeeklyTemp = {
//     animationEnabled: true,
//     axisY2: {
//         labelFontSize: 18,
//         minimum: 0,
//         // maximum: 1250
//     },
//     axisX: {
//         valueFormatString: "M/D",
//         // interval: 1,
//         // intervalType: "week",
//         stripLines:stripLines,
//     },
//     data: [{
//         markerSize:8,
//         color: "#11446d",
//         type: "column",
//         axisYType: "secondary",
//         indexLabelFontColor: "darkSlateGray",
//         indexLabelPlacement: "outside",
//         yValueFormatString: "#",
//         xValueFormatString: "MMM D (DDDD)",
//     }]
// }
//
// export let optionsAverageTemp = {
//     animationEnabled: true,
//     axisY2: {
//         labelFontSize: 18,
//         minimum: 0
//     },
//     axisX: {
//         // interval: 7,
//         // intervalType: "day",
//         valueFormatString: "M/D",
//         stripLines:stripLines,
//     },
//
//     data: [{
//         axisYType: "secondary",
//         // indexLabelFontColor: "darkSlateGray",
//         // indexLabelPlacement: "outside",
//         yValueFormatString: "#",
//         xValueFormatString: "MMM D (DDDD)",
//         type: "spline",
//         // dataPoints: dataPointsArray
//     }]
// }
//
// export let optionsDailyTemp = {
//     animationEnabled: true,
//     axisY2: {
//         labelFontSize: 18,
//         minimum: 0,
//         stripLines:[
//             {
//                 startValue:19.9,
//                 endValue:200,
//                 color:"#fdd4d4",
//                 // labelBackgroundColor: "transparent",
//             }
//         ]
//     },
//     axisX: {
//         valueFormatString: "M/D"
//     },
//     data: [{
//         axisYType: "secondary",
//         axisYIndex: 0, //defaults to 0
//         yValueFormatString: "#",
//         xValueFormatString: "MMM D (DDDD)",
//         type: "spline",
//     },/*{
//                 axisYIndex: 1, //defaults to 0
//                 yValueFormatString: "#",
//                 xValueFormatString: "MMM D, YYYY (DDDD)",
//                 type: "spline",
//                 dataPoints: dataPointsArrayPerCapita
//             }*/]
// }

