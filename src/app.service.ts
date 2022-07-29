import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  home(): string {
    return `
    <div style="display: flex; justify-content: center; padding: 2rem; margin: 2rem">
      <div style="display: flex; flex-direction: column; justify-content: center; padding: 2rem; margin: 2rem; background-color: #f7f7f7; border: 1px solid lightgray; border-radius: 1rem">
        <h1 style="text-align: center; font-family: Arial, sans-serif">eStore API</h1>
        <p style="text-align: center; font-family: Arial, sans-serif">Follow <a href="/docs">this link</a> to read the documentation</p>
      <div>
    <div>
    `;
  }
}
