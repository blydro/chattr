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
- [ ] loading animation during log import/make it less laggy
- [ ] SORT LOG BY DATE

### Backend
- [ ] disconnect from socket server when necessary!
- [x] check for new clients/messages in background!!! (through webworker <-- socket server only) *
- [ ] make peerlist sending more reliable/not dpeendnet on send
  - [ ] make peerlist comparision much smarter (compare whether this peer or an older version of it is already connected, who is the latest one, etc)
- [ ] fancy chat stuff
  - [ ] send files
  - [ ] special commands
  - [ ] read receipts
  - [ ] typing indicator
- [ ] auto cleanup names! *
- [ ] auto/maybe manually cleanup log/names (or at least only send last 50 or so)

=====
* next release
