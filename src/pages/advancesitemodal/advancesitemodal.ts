import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import { SERVER_URL } from '../../environment';
const httpOptions = {
  headers: new HttpHeaders({
      'Content-Type': 'application/json'
  })
}


@IonicPage()
@Component({
  selector: 'page-advancesitemodal',
  templateUrl: 'advancesitemodal.html',
})
export class AdvancesitemodalPage {

  Start_Date: any='';
  End_Date: any='';
  TotalDate= 0;
  start:any='';
  end:any='';

  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams,
    private storage: Storage,
    public http: HttpClient,
    public viewCtrl: ViewController) {
      
  }


  myFunction(date) {
    var d = new Date(date);
    var monthNames = [
      "Jan", "Feb", "Mar",
      "Apr", "May", "Jun", "Jul",
      "Aug", "Sep", "Oct",
      "Nov", "Dec"
    ];
  
    var day = ('0'+ d.getDate()).slice(-2);
    var monthIndex = d.getMonth();
    var year = d.getFullYear();

    return day + '-' + monthNames[monthIndex] + '-' + year;
  }

  getLeaveDays() {
    return this.TotalDate > 1 ? this.TotalDate + " days" : this.TotalDate + " day";
  }

  fetchCalculatedDays(value){

    if (this.End_Date != "" && this.Start_Date != "") {
      this.storage.get('token').then((val) => {
        this.http.get(SERVER_URL + '/fetchCalculatedDays?token=' + val.token + "&Start_Date=" + this.myFunction(this.Start_Date) + "&End_Date=" + this.myFunction(this.End_Date))
        .subscribe((result : any) => {
          var days = 0;
          this.TotalDate = result;
          console.log(this.TotalDate)
          // this.TotalDate = days;
             
          
          console.log(JSON.stringify(result));  
          
        })
      });
    }

  }

  dismiss() {
    let data = { 'foo': 'bar','TotalDate': this.TotalDate  };
    this.viewCtrl.dismiss(this.TotalDate);
    console.log(this.TotalDate)
  }


  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
        // A client-side or network error occurred. Handle it accordingly.
        console.error('An error occurred:', error.error.message);
        return Observable.throw('An error occurred:' + error.error.message);
    } else {      
        // The backend returned an unsuccessful response code.
        // The response body may contain clues as to what went wrong,        
        console.error( 
            `Backend returned code ${JSON.stringify(error)}, ` +
            `body was: ${JSON.stringify(error)}`);
        if (error.status == 422) {
            return Observable.throw('Invalid username or password');
        }
        return Observable.throw('An error occured. Try again later');        
    }   
  };

}
