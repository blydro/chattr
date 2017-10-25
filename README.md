Chattr
==============

### UI
- [x] good looking ui
- [ ] prettify reset button
- [x] don't show ui until we connect to socket server! otherwise things break down real fast (!!!!) <-- fixed underlying bug instead
  - [ ] show failure message when not connected to socket server
- [ ] socket server disconnect message
- [x] include intro message if the log is empty
- [ ] optimize for mobile
- [ ] ice server optimization/better init stuff <-- do more testing

### Backend
- [ ] disconnect from socket server when necessary!
- [ ] check for new clients/messages in background!!! (through webworker <-- socket server only) *
- [ ] make peerlist sending more reliable/not dpeendnet on send *
  - [ ] make peerlist comparision much smarter *
- [ ] fancy chat stuff
  - [ ] send files
  - [ ] special commands
  - [ ] read receipts

=====
* next release
