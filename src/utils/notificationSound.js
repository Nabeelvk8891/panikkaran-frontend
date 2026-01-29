import { Howl } from "howler";
import sound from "../assets/notification.mp3";

export const notificationSound = new Howl({
  src: [sound],
  volume: 1.0,
  preload: true,
});
