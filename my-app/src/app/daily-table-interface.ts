// Interface to represent the processed data for each date
export interface DailyTableData {
    date: string;            // Formatted as "Tuesday, Oct. 15, 2024"
    status: string;          // Weather status (e.g., "Clear", "Rain")
    tempHigh: number;        // Maximum temperature for the date
    tempLow: number;         // Minimum temperature for the date
    windSpeed: number;       // Wind speed for the date
  }


  export interface ExtendedDailyData{
    date: string;            
    status: string;           
    tempHigh: number;           
    tempLow: number;            
    apparentTemperature: number;
    sunriseTime: string;        
    sunsetTime: string;         
    humidity: number;           
    windSpeed: number;          
    visibility: number;         
    cloudCover: number;         
  }


  export interface FavoriteData{
    lat:string;
    lng:string;
    formattedAddress: string;
    city:string,
    state:string,
    rawData: any;          
  }