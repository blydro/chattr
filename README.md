Chattr
==============

### UI
- [ ] prettify reset button
- [x] work without a socket server
  - [ ] show failure message when not connected to socket server
- [ ] socket server disconnect message?
- [x] include intro message if the log is empty
- [ ] optimize for mobile
- [-] SORT LOG BY DATE?! (sort of --> old messages aren't synced anymore)
- [ ] Loading screen!

- [ ] Add https://tailwindcss.com/docs/examples/cards <-- perfect for this project

### Backend
- [ ] better connection restoration
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
- [ ] cleanup names (or at least only send last 50 or so)
- [ ] remove/optimize componentDidMount (devcheetsheets)
- [ ] make notifications smarter about onCLick --> should depend on if app is open or nota
- [ ] rework message sync

- [ ] BUGFIX: on socket disconnect, restore old connection rather than create a new one, confusing the system
