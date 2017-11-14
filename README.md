Chattr
==============

### UI
- [ ] prettify reset button
- [x] work without a socket server
  - [ ] show failure message when not connected to socket server
- [ ] socket server disconnect message?
- [x] include intro message if the log is empty
  - [ ] fix intro message
- [ ] optimize for mobile
- [ ] ice server optimization/better init stuff <-- do more testing
- [ ] loading animation during log import/make it less laggy
- [ ] SORT LOG BY DATE

- [ ] Add https://tailwindcss.com/docs/examples/cards <-- perfect for this project

### Backend
- [ ] disconnect from socket server when necessary!
- [x] push notifications from server.js
- [ ] make peerlist sending more reliable/not dpeendnet on send
  - [ ] make peerlist comparision much smarter (compare whether this peer or an older version of it is already connected, who is the latest one, etc)
- [ ] fancy chat stuff
  - [ ] send files
  - [ ] special commands
  - [ ] read receipts
  - [x] typing indicator
    - [ ] fix typing indicator to be less sensitive --> more of a bounce
    - [ ] move typing sending to state --> if state changes it should sync that chagne!
- [ ] auto cleanup names + log! *
- [ ] auto/maybe manually cleanup log/names (or at least only send last 50 or so)
- [ ] remove/optimize componentDidMount (devcheetsheets)
- [ ] make notifications smarter about onCLick --> should depend on if app is open or not
