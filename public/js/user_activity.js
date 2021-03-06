    var NO_BATTERY_CELLS = 30;
    var MINUTES_PER_CELL = 20;
    var FULL_BATTERY_MINUTES = NO_BATTERY_CELLS * MINUTES_PER_CELL;
    var prizeChangeAllowed;
    
    var activityIconClassMap = {'DISCOVER': 'grid-discover', 'EXPLORE': 'grid-discover', 'ENERGIZE': 'grid-energize', 'READ': 'grid-read', 'LEARN': 'grid-learn', 'ROBOT': 'grid-robot'};
    
    jQuery.ajaxSetup({ cache: false }); 
    
      var showUserPanel = function(obj) {
      var userPanel = '';
      userPanel += '<ul class="nav nav-tabs">'
          + '<li class="active"><a href="#battery" data-toggle="tab"><strong>Read</strong></a></li>'
          + '<li><a href="#activity" data-toggle="tab"><strong>Play</strong></a></li>'
          + '<li><a href="#prize" data-toggle="tab"><strong>Win</strong></a></li>'
          + '</ul>'
          + '<div class="tab-content">'
          + '<div class="tab-pane active" id="battery">';
         if(!isPrizeChangeAllowed()) {
          userPanel += '<br/><div class="row"><div class="col-md-12">'
          + '<div class="alert alert-info"><strong>'+ contentMap['user.activity.message.batteryGrid.instruction'] + '</strong></div>'
          + '</div></div>';
        } 
        userPanel += '<div class="row"><div class="col-md-1"></div><div class="col-md-8"><br/>'
          + '<div id="divBattery"></div></div>';
         if(isPrizeChangeAllowed()) {
           userPanel += '<div class="col-md-1"><br/><button id="btnFillReadingLog" class="btn btn-danger" onclick="fillReadingLog();">Fill<br/>Reading Log</button></div>';
         }
        userPanel += '</div>'
          + '</div>'
          + '<div class="tab-pane" id="activity">';
          
        if(!isPrizeChangeAllowed()) {
          userPanel += '<div class="row"><div class="col-md-12">'
          + '<br/><div class="alert alert-info"><strong>' + contentMap['user.activity.message.activityGrid.instruction'] + '</strong></div>'
          + '</div></div>';
        }
        userPanel += '<div class="row"><div class="col-xs-1 col-sm-1  col-md-1"></div><div class="col-xs-9 col-sm-9 col-md-9">'
          + '<div id="divGrid"></div></div>';
         if(isPrizeChangeAllowed()) {
           userPanel += '<div class="col-xs-2 col-sm-2  col-md-2"><br/><button id="btnFillActivity" class="btn btn-danger" onclick="fillActivity();">Fill<br/>Activity Grid</button></div>';
         }

        userPanel += '</div>'
          + '</div>';
          
        userPanel += '<div class="tab-pane" id="prize">';

         if(!isPrizeChangeAllowed()) {
		  userPanel += '<div class="row"><div class="col-md-12">'
          + '<br/><div class="alert alert-info"><strong>'+ contentMap['user.activity.message.prizeGrid.instruction'] + '</strong></div>'
          + '</div></div>';
         }
          userPanel += '<div class="row"><div class="col-xs-1 col-sm-1 col-md-1"></div><div class="col-xs-11 col-sm-11 col-md-11"><div id="divPrize"></div></div></div>'
          + '</div>'
          + '</div>';
          + '</div>' ;

      emptyUserPanel(); // empty previously opened user panel since there are many components sharing same Id
      $("#pnlbdy_" + $(obj).prop('id')).empty().append(userPanel);
      $('#ttl_' + $(obj).prop('id')).toggleClass("glyphicon-plus glyphicon-minus");

      loadUser($(obj).prop('id'));
    }
    
    var isPrizeChangeAllowed = function() {
      if(typeof prizeChangeAllowed === 'undefined' || !prizeChangeAllowed) {
        return false;
      }
      return true;
    }
    
    var hideUserPanel = function(obj) {
      $("#pnlbdy_" + $(obj).prop('id')).empty();
      $('#ttl_' + $(obj).prop('id')).toggleClass("glyphicon-plus glyphicon-minus");
    }
    
    var emptyUserPanel = function() {
      if(typeof user !== 'undefined' && user.id) {
          $("#pnlbdy_" + user.id).empty();
      }
    }

    var loadUser = function(userId) {
        //userId = $('#userId').val();
        if(!userId) {
            showError("No valid user");
            return;
        }
        
        var userUrl = '/accounts/' + $('#id').val() + '/users/' + userId + '.json';

          $.ajax({url: userUrl,
            contentType: "application/json", 
            type: "GET",
            dataType: "json",
            async: false
           })
            .done(function(resdata){renderUser(resdata);})
            .fail(function( jqXHR) {handleUserError(jqXHR)});
    }
    var user;
    var gridForUserType;
    var prize;

    var renderUser = function(data) {
        user = data.user;
        gridForUserType = data.grid;
        prize = data.prize;
        
        if(!user) {
            showError('User not found');
            return;
        }
        drawUserReadingLog();
        drawUserGrid();
        drawWinTab();
    }
    
    var handleUserError = function(jqXHR) {
        showError('User load failed')
    }
  
  function drawUserGrid() {
    var noCols = 4;
    var gridHtml = '';
    
    for (var cell in gridForUserType.cells) {
      if(cell % noCols == 0) {
        if(gridHtml != '') {
          gridHtml += '</div>';
        }
        gridHtml += '<div class="row">';
      }
      gridHtml += '<div class="grid-padding" ';
      if(isGridCellActionAllowed(cell)) {
        gridHtml += ' onclick="showActivityModal(' + cell + ')"';
      }else{
        gridHtml += ' onclick="activateReadingBattery()"';
      }
      gridHtml += '><div id="cell_' + cell + '" class="grid-bordered ';
      gridHtml += getActivityCellClass(cell, isActivityCompleted(cell));
      gridHtml += '" onmouseover="toggleGridCellDesc(this);return false;" onmouseout="toggleGridCellDesc(this);return false;">';
      gridHtml += '<span class="hide-grid-desc">' + getGridCellDesc(cell) + '</span></div>';
      gridHtml += '</div>';
      
    }
    if(gridHtml != '') {
       gridHtml += '</div>';
    }
    $('#divGrid').empty().append(gridHtml);
    setFillActivityButtonStatus();
  }
  
  function getGridCellDesc(cell) {
    var desc = gridForUserType.cells[cell].description;
    if(typeof desc === 'undefined' || desc.length == 0) {
      return '';
    }
    if(desc.indexOf('http:') < 0 && desc.indexOf('https:') < 0) {
      return desc;
    }
    var urlStart = desc.indexOf('http');
    var urlEnd = desc.indexOf(' ', urlStart);
    if(urlEnd < 0) {
      urlEnd = desc.length;
    }
    var href = desc.substring(urlStart, urlEnd);
    var descWithUrl = desc.substring(0, urlStart) + '<a href="' + href + '" class="link" target="_new">Click Here</a>' + desc.substring(urlEnd);
    return descWithUrl;
  }
  
  function toggleGridCellDesc(obj) {
    $(obj).find('span').toggleClass('show-grid-desc hide-grid-desc');
  }

  function fillReadingLog() {
    var readingLog = parseInt(user.readingLog);
    if(readingLog < FULL_BATTERY_MINUTES && prizeChangeAllowed) {
      updateReadingLog(FULL_BATTERY_MINUTES - readingLog);
      setFillReadingLogButtonStatus();
    }
  }

  function setFillReadingLogButtonStatus() {
    var enabled = parseInt(user.readingLog) < FULL_BATTERY_MINUTES && prizeChangeAllowed;
    if(enabled) {
      $('#btnFillReadingLog').prop("disabled", false);
    }else {
      $('#btnFillReadingLog').prop("disabled", "disabled");
    }
  }

  function fillActivity() {
    if(getPrizeState(1) == 0 && prizeChangeAllowed) {
      if(user && user.activityGrid) {
       for(var iCell=0; iCell < user.activityGrid.length; iCell++) {
         if(typeof user.activityGrid[iCell].activity === 'undefined' || !user.activityGrid[iCell].activity) {
            user.activityGrid[iCell].activity = 1;
            setActivityGridCellClass(iCell, 1);
            user.activityGrid[iCell].notes = 'ADMIN UPDATED';
            user.activityGrid[iCell].updatedAt = new Date();
         }
       }
       saveUserActivity();
       setFillActivityButtonStatus(false);
      }
    }
  }

  function setFillActivityButtonStatus(enabled) {
    if(typeof enabled === 'undefined') {
      enabled = getPrizeState(1) == 0 && prizeChangeAllowed;
    }
    if(enabled) {
      $('#btnFillActivity').prop("disabled", false);
    }else {
      $('#btnFillActivity').prop("disabled", "disabled");
    }
  }

  function getActivityCellClass(cell, activityCompleted) {
    var gridIcon = gridForUserType.cells[cell].gridIcon;
    if(gridIcon && activityIconClassMap[gridIcon]) {
      if(activityCompleted) {
        return activityIconClassMap[gridIcon] + '-03';
      }
      else {
        return activityIconClassMap[gridIcon] + '-01';
      }
    }
  }

  function isGridCellActionAllowed(cell) {
    var gridIcon = gridForUserType.cells[cell].gridIcon;
    return (typeof gridIcon === 'undefined' || gridIcon != 'ROBOT');
  }
  
  function activateReadingBattery() {
    $('a[href="#battery"]').tab('show');
  }

  function activateActivityGrid() {
    $('a[href="#activity"]').tab('show');
  }

  function activateWin() {
    $('a[href="#prize"]').tab('show');
  }
  
  
  function drawUserReadingLog() {
    var batteryHtml = '';
    batteryHtml += '<div class="batt-action">'
       + '<div class="batt-action-icon">&nbsp;</div>'
       + '<div class="batt-action-btn-plus" onclick="updateReadingLog(20);"><img src="../../img/READING LOG Button - ADD 20.png" width="150px"/></div>'
       + '</div>';

    batteryHtml += "<table id='batt'>";
    batteryHtml += "</table>";
    batteryHtml += '<div class="batt-action">'
       + '<div class="batt-action-icon">&nbsp;</div><div class="batt-action-btn-minus"><img src = "../../img/READING LOG Button - REMOVE 20.png" width="150px" onclick="updateReadingLog(-20);"/> </div>'
       + '</div>';
	   
	   
    $('#divBattery').empty().append(batteryHtml);
    if(parseInt(user.readingLog) == 0 || parseInt(user.readingLog) % FULL_BATTERY_MINUTES > 0) {
      drawBattery();
    }
    else {
      drawBadge();
    }
    setFillReadingLogButtonStatus();
    showReadingLog(user.readingLog);
  }

  function drawBattery() {
    var cellIndex = 0;
    var iCell=4;
    var batteryHtml = '<tbody>';
    for(var iLog=NO_BATTERY_CELLS; iLog>0; iLog--, iCell-=2) {
        if(iLog % 5 == 0) {
          if(iLog < NO_BATTERY_CELLS){
            batteryHtml += "</tr>"
          }
          batteryHtml += "<tr>";
          iCell = 4;
        }
        cellIndex = iLog - iCell;
        batteryHtml += getBatteryCell(cellIndex);
        //batteryHtml += getBatteryCellMessage(cellIndex);
    }
    batteryHtml += "</tr></tbody>";
    $('#batt').empty().append(batteryHtml);
    $('#batt').removeClass('badge').addClass('batt');
    $('div.batt-badge-desc').empty().append('<div class="text-align">What is behind above grid?</div>');
  }

  function drawBadge() {
    var badgeHtml = "<tbody><tr>"
    badgeHtml += "<td><img src='../../img/badges/" + badges[Math.floor(parseInt(user.readingLog) / FULL_BATTERY_MINUTES) -1].imageSrc + "' class='badge-img'></td>"
    badgeHtml += "</tr></tbody>";
    $('#batt').empty().append(badgeHtml);
    $('#batt').removeClass('batt').addClass('badge');
    $('div.batt-badge-desc').empty().append('<div class="text-align">' + badges[Math.floor(parseInt(user.readingLog) / FULL_BATTERY_MINUTES) -1].desc + '</div>');

    if(user.prizes[2].state == 1 && !prizeChangeAllowed) {
      showMsgModal(1, 0);
    }
  }
  
  function getBatteryCell(iLog, readingLog) {
      var cellHtml = "<td id='battCell_" + iLog + "' ";
      cellHtml += "class='cell-off'> </td>";
      return cellHtml;
  }
  
  function getBatteryCellMessage(iLog){
    var cellMsgHtml = '';
      if((iLog) % 9 == 0) {
        cellMsgHtml += "<td rowspan='3' class='batt-message'><div id='msg" + iLog + "' class='alert alert-info hidden'>";
        if(iLog / 9 == 5) {
          cellMsgHtml += '<p>Thanks for charging my battery, Reader! You read for 15 hours! I left a special prize for you at your local San Jose Public Library!</p>';
        }
        else if(iLog / 9 == 4) {
          cellMsgHtml += '<p>You have read <strong>12 hours</strong>! Almost there!</p>';
        }
        else if(iLog / 9 == 3) {
          cellMsgHtml += '<p>You have read <strong>9 hours</strong>! You rock!</p>';
        }
        else if(iLog / 9 == 2) {
          cellMsgHtml += '<p>You have read <strong>6 hours</strong>! Keep it up!</p>';
        }
        else {
          cellMsgHtml += '<p>You have read <strong>3 hours</strong>! Good job!</p>';
        }
        cellMsgHtml += "</div></td>";
      }
      return cellMsgHtml;
  }
  
  function updateReadingLog(inc) {
    if(user.readingLog < 18000 && user.readingLog >= 0 ) {
      user.readingLog = parseInt(user.readingLog) + inc;
      if(user.readingLog < 0) {
        user.readingLog = 0;
      }
      if(user.readingLog % FULL_BATTERY_MINUTES == 0 && user.readingLog > 0) {
        drawBadge();
      }
      else {
        if($('#batt').attr('class') != 'batt') {
          drawBattery();
        }
        showReadingLog(user.readingLog);
      }
      saveUserActivity();
    }
  }
  
  function showReadingLog(readingLog) {
    if(typeof readingLog === 'undefined') {
      return;
    }
    var cellLogged = (readingLog % FULL_BATTERY_MINUTES) / 20;
    for(var iCell=1; iCell<=NO_BATTERY_CELLS; iCell++) {
      if(iCell <= cellLogged) {
        $('#battCell_' + iCell).removeClass('cell-off').addClass('cell-activated');
      }
      else {
        $('#battCell_' + iCell).removeClass('cell-activated').addClass('cell-off');
      }
    }
    //showBatteryMessage(cellLogged);    
  }
  
  function showBatteryMessage(cellIndex) {
    var msgId = 0;
    var prevMsgId = 0;
    if(cellIndex % 9 == 0) {
      msgId = cellIndex;
      prevMsgId = msgId - 9;
    }
    if(cellIndex >= 45) {
      $('#chargeMe').addClass('hidden');
      showRobotOnFullCharge();
    }else {
      $('#msg' + msgId).removeClass('hidden').addClass('show');
      $('#msg' + prevMsgId).removeClass('show').addClass('hidden');
    }
  }
  
  function showRobotOnFullCharge() {
    for(var iRt = 9; iRt <= 45; iRt+=9) {
      $('#msg' + iRt).html('');
      $('#msg' + iRt).removeClass('hidden').addClass('robot-on-' + (iRt / 9));
    }
  }
  
  function showActivityModal(cellIndex) {
    $('#activityModalHeader').empty().append('<strong>Your Challenge: ' + gridForUserType.cells[cellIndex].description + '</strong>');
    var modalBody = '';
    modalBody += '<dl class="dl">'
    modalBody += '<dt>' + gridForUserType.cells[cellIndex].whatDidIDo + ': (Optional)</dt>';
    modalBody += '<dd><textarea class="form-control" rows="4" id="activityNotes">';
    modalBody += getActivityNotes(cellIndex);
    modalBody += '</textarea></dd></dl>';
    modalBody += '<div class="text-right"><label> I did it!<input id="activityCompleted" type="checkbox"' + (isActivityCompleted(cellIndex)?'checked':'') + ' data-on-text="Yes" data-off-text="No"></label></div>';
    
    $('#activityModal').find('.modal-body').empty().append(modalBody);
    
    var modalFooter = '<button type="button" class="btn btn-default" onclick="closeActivityModal()">Cancel</button>';
    modalFooter += '<button type="button" class="btn btn-primary" onclick="closeActivityModal(' + cellIndex + ')">Save</button>';
    $('#activityModal').find('.modal-footer').empty().append(modalFooter);
    $("#activityCompleted").bootstrapSwitch()
    $('#activityModal').modal('show');
  }
  
  function isActivityCompleted(cellIndex) {
    if(user.activityGrid && user.activityGrid.length > cellIndex && user.activityGrid[cellIndex].activity == 1) {
      return true;
    }    
    return false;
  }
  
  function getActivityNotes(cellIndex) {
    if(user.activityGrid && user.activityGrid.length > cellIndex && user.activityGrid[cellIndex].notes) {
      return user.activityGrid[cellIndex].notes;
    }    
    return '';
  }

  function getPrizeNotes(prizeIndex) {
    if(user.prizes && user.prizes.length > prizeIndex && user.prizes[prizeIndex].notes) {
      return user.prizes[prizeIndex].notes;
    }    
    return '';
  }
  
  function closeActivityModal(cellIndex) {
    if(typeof cellIndex != 'undefined') {
      var activityCompleted = 0;
      if($('#activityCompleted').prop("checked")) {
        activityCompleted = 1;
      }
      updateUserActivity(cellIndex, activityCompleted);
    }
    $('#activityModal').modal('hide');
  }

  function closePrizeModal(prizeIndex, state) {
    $('#prizeModal').modal('hide');
    if(typeof prizeIndex != 'undefined') {
      updatePrizeState(prizeIndex, state);
    }
  }
  
  function updateUserActivity(cellIndex, activityCompleted) {
    if(user && user.activityGrid && user.activityGrid.length > cellIndex && user.activityGrid[cellIndex]) {
      var dirty = false;
      var activityNotes = $('#activityNotes').prop('value');
      if(typeof user.activityGrid[cellIndex].activity === 'undefined' || (activityCompleted != user.activityGrid[cellIndex].activity)) {
        user.activityGrid[cellIndex].activity = activityCompleted;
        setActivityGridCellClass(cellIndex, activityCompleted);
        dirty = true;
      }
      if(typeof user.activityGrid[cellIndex].notes === 'undefined' || (activityNotes != user.activityGrid[cellIndex].notes)) {
        user.activityGrid[cellIndex].notes = activityNotes;
        dirty = true;
      }
      if(dirty) {
        user.activityGrid[cellIndex].updatedAt = new Date();
        /*------------------------ Persist the User Activity --------------------*/
        saveUserActivity();
      }
    }
  }

  function updatePrizeState(prizeIndex, state) {
    if(user && user.prizes){
      var dirty = false;
      if(user.prizes.length <= prizeIndex) {
         user.prizes[prizeIndex] = {state: 0, notes: '', updatedAt: new Date()};
          dirty = true;
      }
      if(typeof user.prizes[prizeIndex].state === 'undefined' || (state != user.prizes[prizeIndex].state)) {
        user.prizes[prizeIndex].state = state;
        drawWinTab();
        dirty = true;
      }
      if($('#prizeNotes').length) {
        var prizeNotes = $('#prizeNotes').prop('value');
        if(typeof user.prizes[prizeIndex].notes === 'undefined' || (prizeNotes != user.prizes[prizeIndex].notes)) {
          user.prizes[prizeIndex].notes = prizeNotes;
          dirty = true;
        }
      }
      if(dirty) {
        user.prizes[prizeIndex].updatedAt = new Date();
        /*------------------------ Persist the User Activity --------------------*/
        saveUserActivity();
      }
    }
  }
  
  function setActivityGridCellClass(cellIndex, activityCompleted) {
      $('#cell_' + cellIndex).removeClass(getActivityCellClass(cellIndex, !activityCompleted)).addClass(getActivityCellClass(cellIndex, activityCompleted));
  }

  function saveUserActivity() {
    var type = "PUT";
    var saveUrl = '/accounts/' + $('#id').val() + '/users/' + user.id + '.json';
    $.ajax({url: saveUrl,
        data: JSON.stringify({user: user}), 
        contentType: "application/json", 
        type: "PUT",
        dataType: "json"})
        .done(function(resdata){saveUserActivitySuccess(resdata);})
        .fail(function( jqXHR) {saveFailed(jqXHR)});
  }
  
  function saveUserActivitySuccess(data) {
      if(data.user && data.user.activityGrid && data.user.prizes) {
          if(isPrizeStateChanged(data.user)) {
              user = data.user;
              if((user.prizes[0].state == 1 || user.prizes[1].state == 1) && !prizeChangeAllowed) {
                showMsgModal(0, 1);
              }
          }
          drawWinTab();
      }
  }
  
  function isPrizeStateChanged(data) {
      for(var iPrz=0; iPrz < data.prizes.length; iPrz++) {
          if(user.prizes[iPrz].state != data.prizes[iPrz].state) {
              return true;
          }
      }
      return false;
  }

  function saveUserActivityFailed(jqXHR) {
    showError('Save reading log failed')
  }


//---------------------- Win Tab (Prizes)-------------

  function drawWinTab() {
    var winHtml = '<div id="winReadingStatus"></div>';
    winHtml += '<div id="winPrize"></div>'
    winHtml += '<div id="winReadingBadges"></div>'
    
    $('#divPrize').empty().append(winHtml);
    showReadingStatus();
    showPrize();
    showReadingBadges();
  }

  function showReadingStatus() {
    $('#winReadingStatus').empty().append(getReadingstatusHtml());
  }

  function showPrize() {
    $('#winPrize').empty().append(getPrizeHtml());
  }
  function showReadingBadges() {
    $('#winReadingBadges').empty().append(getReadingBadgesHtml());
  }

  function getReadingstatusHtml() {
    var readStatusHtml = '<div class="row"><div class="col-md-11 col-sm-11 col-xs-11 reading-status-title">You have read</div></div>';
    readStatusHtml += '<div class="row reading-status-pane">';
    readStatusHtml += '<div class="col-xm-4 col-sm-4 col-md-4"><div class="row"><div class="col-xm-11 col-sm-11 col-md-11 label reading-status reading-status-bg">' + getReadingLogHourPart() + '</div></div><div class="row"><div class="col-xm-11 col-sm-11 col-md-11 reading-status">Hours</div></div></div>';
    readStatusHtml += '<div class="col-xm-4 col-sm-4 col-md-4"><div class="row"><div class="col-xm-11 col-sm-11 col-md-11 label reading-status reading-status-bg">' + getReadingLogMinutePart() + '</div></div><div class="row"><div class="col-xm-11 col-sm-11 col-md-11 reading-status">Minutes</div></div></div>';
    readStatusHtml += '<div class="col-xm-4 col-sm-4 col-md-4"><button class="btn btn-danger" onclick="displayCertificate()"><br/>Print your<br/>Reading<br/>certificate!<br/><br/></button></div>';
    readStatusHtml += '</div>';
    return readStatusHtml;
  }

    //added for opening the certificate
    function  displayCertificate() {
      var name = user.firstName + " " + user.lastName;
      var time = getReadingLogHourPart() + ":" + getReadingLogMinutePart();
      window.open('/certificate-html2.html?name=' + name + '&time=' + time,'_blank' ,"width=900, height=687");
    }

  function getPrizeHtml() {
    var prizeHtml = '<div class="row"><div class="col-md-11 col-sm-11 col-xs-11 reading-status-title">Prizes</div></div>';
    prizeHtml += '<div class="row reading-status-pane">';
    prizeHtml += '<div class="col-xm-3 col-sm-3 col-md-3">' + getPrizeBingoHtml() + '</div>';
    prizeHtml += '<div class="col-xm-1 col-sm-1 col-md-1"></div>';
    prizeHtml += '<div class="col-xm-3 col-sm-3 col-md-3">' + getPrizeBlackoutHtml() + '</div>';
    prizeHtml += '<div class="col-xm-1 col-sm-1 col-md-1"></div>';
    prizeHtml += '<div class="col-xm-3 col-sm-3 col-md-3">' + getPrizeReadingHtml() + '</div>';
    prizeHtml += '</div>'
    return prizeHtml;
  }

  function getPrizeBingoHtml() {
    var prizeHtml = '<div class="prize-title prize-title-bingo">Bingo</div>'
    prizeHtml += getUserPrizeTag(0);
    prizeHtml += getUserPrizeFooter(0);
    return prizeHtml;
  }

  function getPrizeBlackoutHtml() {
    var prizeHtml = '<div class="prize-title prize-title-blackout">Black&nbsp;out</div>'
    prizeHtml += getUserPrizeTag(1);
    prizeHtml += getUserPrizeFooter(1);
    return prizeHtml;
  }

  function getPrizeReadingHtml() {
    var prizeHtml = '<div class="prize-title prize-title-reading">Reading</div>'
    prizeHtml += getUserPrizeTag(2);
    prizeHtml += getUserPrizeFooter(2);
    return prizeHtml;
  }
  
  function getUserPrizeTag(prizeIndex) {
      var prizeHtml = '<a href="#" title="Click to Play!" onclick="';
      if(!isPrizeChangeAllowed()) {
        if(prizeIndex < 2)
          prizeHtml += 'activateActivityGrid()';
        else
         prizeHtml += 'activateReadingBattery()';
      }
      else {
         prizeHtml += 'showPrizeModal(' + prizeIndex + ')';
      }
      prizeHtml += ';return false;" data-target="#prizeModal">';
      prizeHtml += '<div class="prize ' + getPrizeClass(prizeIndex) + '">&nbsp;</div>';
      prizeHtml += '</a>';
      return prizeHtml;
  }

  function getUserPrizeFooter(prizeIndex) {
      var prizeHtml = '<div class="prize-footer">';
      prizeHtml += '<b>' + getPrize(prizeIndex) + '</b><br/>';
      switch(getPrizeState(prizeIndex)){
        case 0:
                if(!isPrizeChangeAllowed()) {
                  prizeHtml += '(Click to Play!)';
                }else{
                  prizeHtml += '(Not Earned)';
                }
                break;
        case 1:
                prizeHtml += '(Prize Earned!)';
                break;
        case 2:
                prizeHtml += '(Prize Awarded!)';
                break;
      }
      prizeHtml += '</div>';
      return prizeHtml;
  }
  
  function getPrize(prizeIndex) {
    if(!prize) {
        return '';
    }
    var prizeDesc = '';
    switch(prizeIndex) {
        case 0:
            prizeDesc = prize.prize1;
            break;
        case 1:
            prizeDesc = prize.prize2;
            break;
        case 2:
            prizeDesc = prize.prize3;
            break;
    }
    if(typeof prizeDesc === 'undefined') {
        return '';
    }
    return prizeDesc;
  }

  function getPrizeClass(prizeIndex) {
    var prizeClass = 'prize-';
    switch(prizeIndex) {
      case 0:
              prizeClass += 'bingo-';
              prizeClass += userTypes[user.userType].toLowerCase().replace(' ', '-') + '-';
              break;
      case 1: 
              prizeClass += 'blackout-';
              prizeClass += userTypes[user.userType].toLowerCase().replace(' ', '-') + '-';
              break;
      case 2:
              if(userTypes[user.userType].toLowerCase() == 'adult') {
                prizeClass += 'blackout-';
                prizeClass += userTypes[user.userType].toLowerCase().replace(' ', '-') + '-';
              }
              else {
                prizeClass += 'reading-';
              }
              break;
    }

    switch(getPrizeState(prizeIndex)) {
      case 0:
              prizeClass += 'not-earned';
              break;
      case 1:
              prizeClass += 'earned';
              break;
      case 2:
              prizeClass += 'awarded';
              break;
    }
    return prizeClass;
  }

  function showPrizeModal(prizeIndex) {
    if(!user || !user.prizes) {
      return;
    }
    var modalBody = '';
    var modalFooter = '';
    if(isPrizeChangeAllowed()) {
      if(getPrizeState(prizeIndex) == 0) {
        return;
      }
      modalBody = '<dl class="dl-horizontal">';
      modalBody += '<dt>Prize ' + (prizeIndex +1) + '</dt>';
      modalBody += '<dd>' + getPrize(prizeIndex) + '</dd>';
      modalBody += '</dl>';
      modalBody += '<dl class="dl-horizontal">'
      modalBody += '<dt>Notes</dt>';
      modalBody += '<dd><textarea class="form-control" rows="3" id="prizeNotes">';
      modalBody += getPrizeNotes(prizeIndex);
      modalBody += '</textarea></dd></dl>';

      modalFooter = '<button type="button" class="btn btn-default" ';
      if(getPrizeState(prizeIndex) == 2) {
        modalFooter += ' onclick="closePrizeModal(' + prizeIndex + ', 1);">Prize Not Awarded</button>';
      }
      else {
        modalFooter += ' onclick="closePrizeModal(' + prizeIndex + ', 2);">Prize Awarded</button>';
      }
      modalFooter += '<button type="button" class="btn btn-default" onclick="closePrizeModal(' + prizeIndex + ', ' + getPrizeState(prizeIndex) + ')">Close</button>';
    }
    else {
      modalBody = '<p>';
      if(getPrizeState(prizeIndex) == 0) {
        if(prizeIndex < 4) {
          modalBody += 'Complete 5 squares in a row (vertical, horizontal, or diagonal) to win ';
        }
        else {
          modalBody += 'Complete all the squares in your Game Grid to win ';
        }
      }
      else if(getPrizeState(prizeIndex) == 1) {
        modalBody += 'Congratulations! You have won ';
      }
      if(getPrizeState(prizeIndex) == 2) {
        modalBody += 'Congratulations! You have collected <strong>' + getPrize(prizeIndex) + '</strong>.';
      }
      else {
        modalBody += '<strong>' + getPrize(prizeIndex) + '</strong>. Visit your local San José Public Library  to pick up prizes from June 2 to July 31.';
      }
      modalBody += '</p>';
      modalFooter += '<button type="button" class="btn btn-default" onclick="closePrizeModal()">Close</button>';
    }
    
    $('#prizeModal').find('.modal-body').empty().append(modalBody);
    $('#prizeModal').find('.modal-footer').empty().append(modalFooter);
    
    $('#prizeModal').modal('show');
  }
  
  function getPrizeState(prizeIndex) {
    if(typeof user.prizes === 'undefined' || user.prizes.length <= prizeIndex || typeof user.prizes[prizeIndex].state === 'undefined') {
      return 0;
    }
    else {
      return user.prizes[prizeIndex].state;
    }
  }


  function showMsgModal(readingLogMsg, activityGridMsg) {
    var modalBody = '';
    var modalFooter = '';
    modalBody = '<p>';
    if(readingLogMsg && (user.readingLog % FULL_BATTERY_MINUTES == 0) && user.prizes[2].state < 2) {
      if(user.readingLog == FULL_BATTERY_MINUTES) {
        modalBody += contentMap["user.activity.message.readinglog.full.winPrize"].replace("[1]", "<b>" + getPrize(2) + "</b>").replace(/\n/g, "<br>");
      }
      else {
        modalBody += contentMap["user.activity.message.readinglog.full"];
      }
    }
    else if(activityGridMsg){
      if(user.prizes[1].state == 1) {
        modalBody += contentMap["user.activity.message.activityGrid.blackout.winPrize"].replace("[1]", "<b>" + getPrize(1) + "</b>").replace(/\n/g, "<br>");
      }
      else if(user.prizes[0].state == 1) {
        modalBody += contentMap["user.activity.message.activityGrid.rowOrColumn.winPrize"].replace("[1]", "<b>" + getPrize(0) + "</b>").replace(/\n/g, "<br>");
      }
    }
    modalBody += '</p>';
    modalFooter += '<button type="button" class="btn btn-default" onclick="closeMsgModal()">Close</button>';
    
    $('#msgModal').find('.modal-body').empty().append(modalBody);
    $('#msgModal').find('.modal-footer').empty().append(modalFooter);
    
    $('#msgModal').modal('show');
  }

  function closeMsgModal() {
    $('#msgModal').modal('hide');
    //mgsModal is used for only showing prize message
    activateWin();
  }

  function showBadgeModal(bdgId) {
    var modalBody = '<img  width="100%" src="../../img/badges/' + badges[bdgId].imageSrc + '"/>';
    $('#badgeModalHeader').empty().append(badges[bdgId].desc);
    $('#badgeModal').find('.modal-body').empty().append(modalBody);
    $('#badgeModal').modal('show');
  }

  function closeBadgeModal() {
    $('#msgModal').modal('hide');
  }



  function getReadingLogHourPart() {
    var hour = 0;
    if(typeof user.readingLog != "undefined") {
      hour = Math.floor(parseInt(user.readingLog) / 60);
    }
    return formatTime(hour);
  }

  function getReadingLogMinutePart() {
    var minute = 0;
    if(typeof user.readingLog != "undefined") {
      minute = parseInt(user.readingLog) % 60;
    }
    return formatTime(minute);
  }

  function formatTime(num) {
    var str = String(num);
    if(str.length == 1) {
      str = '0' + str;
    }
    return str;
  }

  function getReadingBadgesHtml() {
    var prizeHtml = '<div class="row"><div class="col-md-11 col-sm-11 col-xs-11 reading-status-title">Reading Badges Collected / Unlock them all!</div></div>';
    prizeHtml += '<div class="row reading-status-pane">';
    for(var iBdg=0; iBdg<30; iBdg++) {
      prizeHtml += getReadingBadge(iBdg);
      if(((iBdg+1)%6 == 0) && parseInt(user.readingLog) < (FULL_BATTERY_MINUTES * iBdg)){
        break;
      }
    }
    prizeHtml += '</div>';
    return prizeHtml;
  }

  function getReadingBadge(badgeIndex) {
    var badgeHtml = '<div class="col-xm-2 col-sm-2 col-md-2">';
    if(parseInt(user.readingLog) / FULL_BATTERY_MINUTES >= (badgeIndex+1)) {
       badgeHtml += '<div class="read-badge read-badge-collected"><a href="#" onclick="showBadgeModal(' + badgeIndex + ');return false;"><img  src="../../img/badges/' + badges[badgeIndex].imageSrc + '" width="100%"/></a></div>'; 
    }
    else {
      badgeHtml += '<div class="read-badge read-badge-locked"><img  src="../../img/badges/OFF - reading badge.png" width="100%"/></div>'; 
    }
    badgeHtml += '</div>';
    return badgeHtml;
  }

