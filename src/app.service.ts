import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { Mail } from './interfaces/Mail';
import { ClientResponse } from './interfaces/ClientResponse';

@Injectable()
export class AppService {

  constructor() {
      axios.defaults.baseURL = `http://${process.env.CUST_BUILT_MAILER}:${process.env.CUST_BUILT_MAILER_PORT}`;
  }

  sendMail(mail: Mail): Promise<boolean> {
      debugger
      return new Promise<boolean>((resolve, reject) => {
        axios.post('/sendMail', mail, {
            responseType: "json"
        }).then((res) => {
            debugger
            if(res.status !== 200) {
                return resolve(false);
            }
            let data = res.data as ClientResponse;
            resolve(data.status ? true : false);
        });
      });
  }
}
