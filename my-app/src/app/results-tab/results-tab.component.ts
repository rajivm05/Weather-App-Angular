import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DataService } from '../data.service';
import { AnimationToggleService } from '../animation-toggle.service';

import { DailyTableData, ExtendedDailyData } from '../daily-table-interface';

import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import HC_more from 'highcharts/highcharts-more'
import HighchartsWindbarb from 'highcharts/modules/windbarb';


HC_more(Highcharts);
HighchartsWindbarb(Highcharts);


@Component({
  selector: 'app-results-tab',
  standalone: true,
  imports: [CommonModule, MatTabsModule, MatTableModule, HighchartsChartModule, MatButtonModule, MatIconModule],
  templateUrl: './results-tab.component.html',
  styleUrl: './results-tab.component.css'
})
export class ResultsTabComponent implements OnInit {
  //highcharts
  Highcharts_minmax: typeof Highcharts = Highcharts;
  chartOptions_minmax: Highcharts.Options = {};

  //title
  cityName:string='';
  stateName:string='';

  //meteogram
  Highcharts_met: typeof Highcharts = Highcharts;
  chartOptions_met: Highcharts.Options = {};
  temperatures:any = [];
  humidity:any = [];
  pressures:any =[];
  winds:any = [];
  

  //html support
  displayedColumns: string[] = ['index', 'date', 'status', 'tempHigh', 'tempLow', 'windSpeed'];
  
  //service variables
  preprocessedTableData:DailyTableData[] = [];
  extendedWeatherData:ExtendedDailyData[] = [];
  weatherCodesReversed:{[key: string]: string} = {'':''};
  formattedAddress:string = "";
  
  constructor(public dataService: DataService, private animationService: AnimationToggleService) { 
    this.weatherCodesReversed = dataService.weatherCodesReversed;
  }
  ngOnInit(): void { 
    this.dataService.preprocessedTableData$.subscribe(data => {
      this.preprocessedTableData = data;
      this.formattedAddress = this.dataService.formattedAddress;
      this.createChart_minmax();
      this.parseData();
      this.createChart_met();
      // console.logs("Doing this from results tab component!");
      // console.log(this.preprocessedTableData);  
    });
    this.dataService.extendedData$.subscribe(data => {
      this.extendedWeatherData = data;
      // console.log("Doing this from results tab component!");
      // console.log(this.extendedWeatherData);  
    });
    this.dataService.formattedAddressData$.subscribe(data =>{
      this.formattedAddress = data;
    });
    this.dataService.cityData$.subscribe(data =>{
      this.cityName = data;
    });
    this.dataService.stateData$.subscribe(data =>{
      this.stateName = data;
    });
  }

  //place holder for details pane
  changePointer(index:number):void{
    // console.log(index);
    this.dataService.pointToDate = index;
    this.callToggleService();
  }
  callToggleService(){
    // console.log("Calling that service");
    this.animationService.toggleView();
  }
  addToFavorites(){
    this.dataService.addToFavorites();
  }
  removeFromFavorites(){
    this.dataService.removeFromFavorites();
  }
  createChart_minmax(){
    const dates = this.preprocessedTableData.map(data => new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
    const tempHigh = this.preprocessedTableData.map(data => data.tempHigh);
    const tempLow = this.preprocessedTableData.map(data => data.tempLow);
  
    this.chartOptions_minmax = {
      chart: {
        type: 'arearange',
        // zoomType: 'x'
      },
      title: {
        text: 'Temperature Ranges (Min, Max)'
      },
      xAxis: {
        categories: dates,
        type: 'category',
        title: {
          text: null
        }
      },
      yAxis: {
        title: {
          text: null
        }
      },
      tooltip: {
        shared: true,
        valueSuffix: '°F',
        formatter: function () {
          const point = this.points?.[0]?.point;
          if (point) {
            return `${this.x}<br>Temperatures: ${point.low}°F - ${point.high}°F`;
          }
          return 'Data unavailable';
        }
      },
      plotOptions: {
        series: {
          pointStart: 0,
          marker: {
            enabled: true,
            radius: 3,
            fillColor: '#00aaff'
          }
        }
      },
      series: [{
        type: 'arearange',
        name: 'Temperature Range',
        data: tempLow.map((min, index) => [min, tempHigh[index]]),
        color: {
          linearGradient: {
            x1: 0,
            y1: 1,
            x2: 0,
            y2: 0
          },
          stops: [
            [0, '#00aaff'],
            [0.5, '#ADD8E6'],
            [1, '#F7990B']
          ]
        },
        lineColor: '#F9B349',
        fillOpacity: 0.5,
        zIndex: 0
      }]
    };
  }
  parseData(){
    const data:any = this.dataService.rawData;
    let pointStart:number|undefined;
    if(!data){
      return;
    }
    data.data.timelines[1].intervals.forEach((node:any, i:number) =>{
      const x = Date.parse(node.startTime);
      const to = x+1 * 36e5;
      this.temperatures.push({x, y:node.values.temperature, to});
      this.humidity.push({x, y:Math.round(node.values.humidity)});
      if(i%2==0){
        this.winds.push({x, value:node.values.windSpeed, direction:node.values.windDirection});

      }
      this.pressures.push({x, y:node.values.pressureSurfaceLevel});
      if(i===0){
        pointStart = (x+to)/2;
      }
    });

  }
  createChart_met(){
    // HighchartsWindbarb(this.Highcharts_met);
    this.chartOptions_met = {
      chart: {
        plotBorderWidth: 1,
        alignTicks: false,
        scrollablePlotArea: {
            minWidth: 720
        }
    },
      // chart: {
      //   type: 'spline'
      // },
      title: {
        text: 'Hourly Weather (For Next 5 Days)',
        align: 'center',
        style: {
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis'
        }
    },
    tooltip: {
      shared: true,
      useHTML: true,
      headerFormat:
          '<small>{point.x:%A, %b %e, %H:%M} - ' +
          '{point.point.to:%H:%M}</small><br>' +
          '<b>{point.point.symbolName}</b><br>'

  },
    xAxis: [{ 
      type: 'datetime',
      tickInterval: 6 * 36e5, 
      minorTickInterval: 36e5, 
      tickLength: 0,
      gridLineWidth: 1,
      gridLineColor: 'rgba(128, 128, 128, 0.1)',
      startOnTick: false,
      endOnTick: false,
      minPadding: 0,
      maxPadding: 0,
      offset: 30,
      showLastLabel: true,
      labels: {
          format: '{value:%H}'
      },
      crosshair: true
  }, { 
      linkedTo: 0,
      type: 'datetime',
      tickInterval: 24 * 3600 * 1000,
      labels: {
          format: '{value:<span style="font-size: 12px; font-weight: ' +
              'bold">%a</span> %b %e}',
          align: 'left',
          x: 3,
          y: 8
      },
      opposite: true,
      tickLength: 20,
      gridLineWidth: 1
  }],
  yAxis: [{ 
    title: {
        text: null
    },
    labels: {
        format: '{value}°',
        style: {
            fontSize: '10px'
        },
        x: -3
    },
    plotLines: [{ 
        value: 0,
        color: '#BBBBBB',
        width: 1,
        zIndex: 2
    }],
    maxPadding: 0.3,
    minRange: 8,
    tickInterval: 10,
    gridLineColor: 'rgba(128, 128, 128, 0.1)'

}, { // precipitation axis
  allowDecimals: false,
    title: {
        text: null
    },
    labels: {
        enabled: false
    },
    gridLineWidth: 0,
    tickLength: 0,
    minRange: 10,
    min: 0

}, { // Air pressure
    allowDecimals: false,
    title: { // Title on top of axis
        text: 'hPa',
        offset: 0,
        align: 'high',
        rotation: 0,
        style: {
            fontSize: '10px',
            // color: Highcharts.getOptions().colors[2]
        },
        textAlign: 'left',
        x: 3
    },
    labels: {
        style: {
            fontSize: '8px',
            // color: Highcharts.getOptions().colors[2]
        },
        y: 2,
        x: 3
    },
    gridLineWidth: 0,
    opposite: true,
    showLastLabel: false
  }],

  legend: {
    enabled: false
  },

  plotOptions: {
    series: {
        pointPlacement: 'between'
    }
  },

  series: [{
    name: 'Temperature',
    data: this.temperatures,
    type: 'spline',
    marker: {
        enabled: false,
        states: {
            hover: {
                enabled: true
            }
        }
    },
    tooltip: {
        pointFormat: '<span style="color:{point.color}">\u25CF</span>' +
            ' ' +
            '{series.name}: <b>{point.y}°C</b><br/>'
    },
    zIndex: 1,
    color: '#FF3333',
    negativeColor: '#48AFE8'
}, 
{
    name: 'Humidity',
    data: this.humidity,
    type: 'column',
    color: '#68CFE8',
    yAxis: 1,
    groupPadding: 0,
    pointPadding: 0,
    grouping: false,
    dataLabels: {
      enabled:true,
        filter: {
            operator: '>',
            property: 'y',
            value: 0
        },
        style: {
            fontSize: '8px',
            color: '#666'
        }
    },
    tooltip: {
        valueSuffix: ' mm'
    }
  }, 
  {
    name: 'Air pressure',
    type:'spline',
    // color: Highcharts.getOptions().colors[2],
    marker:{
      enabled:false
    },
    color:'#FFFF00',
    data: this.pressures,
    shadow: false,
    tooltip: {
        valueSuffix: ' hPa'
    },
    dashStyle: 'ShortDot',
    yAxis: 2
  }, {
    name: 'Wind',
    type: 'windbarb',
    id: 'windbarbs',
    // color: Highcharts.getOptions().colors[1],
    lineWidth: 1.5,
    data: this.winds,
    vectorLength: 18,
    yOffset: -15,
    tooltip: {
        valueSuffix: ' m/s'
    }
    }]    
    };  
  }



}
