  var params = {id: ""};
  var properties = [];
  var optionsForSelect = [];
  var url = "/";
  
  function loadParams(id) {
    for(var k in params) {
      if(params.hasOwnProperty(k)) {
        if(k == "id" && id) {
          params[k] = id;
        }
        else {
          params[k] = $("#" + k).val();
        }
      }
    }
  }
  
  
  function addRow() {
      if($("#row-1").length > 0) {
        alert("Please save the newly added Branch");
        return;
      }
      if($("#" + properties[0]["name"]).length > 0) {
        alert("Please save or cancel Branch you are editing");
        return;
      }
      
      $("#dataTable > tbody").find("td[colspan]").detach();
      var rowElem = $("<tr id='row_-1'></tr>");
      for(var i = 0; i < properties.length; i++) {
        if(properties[i].name == "id") {
          continue;
        }
        if(properties[i].type != "select") {
           var inputField = '<td><input type="' + properties[i].type + '" id="' + properties[i].name + '" class="form-control" maxLength="' + properties[i].maxLength + '"';
           if(properties[i].type == "number") {
             if(properties[i].min) {
               inputField += ' min="' + properties[i].min + '"';
             }
             if(properties[i].max) {
               inputField += ' max="' + properties[i].max + '"';
             }
             if(properties[i].onkeydown) {
               inputField += ' onkeydown="' + properties[i].onkeydown + '"';
             }
           }
           inputField += '/></td>';
           rowElem.append(inputField);
        }else{
            rowElem.append('<td>' + selectTag(optionsForSelect, "", properties[i]) + '</td>');
        }
      }
      rowElem.append('<td><a href="#" onclick="javascript:saveIntoDB(\'-1\');return false;"><i class="glyphicon glyphicon-ok"/></a>&nbsp;<a href="#" onclick="javascript:cancelEditRow(\'-1\');return false;"><i class="glyphicon glyphicon-remove"/></a></td>');
      $("#dataTable > tbody").find("tr:last").after(rowElem);
  }
  
  function selectTag(optionsForSlct, selectedValue, property) {
      var tag = '';
      
      if(!property || !optionsForSlct) {
        return tag;
      }
      
      tag += '<select name="' + property.name + '" id="' + property.name + '" class="form-control" >'
      for(var i in optionsForSlct) {
        tag += '<option value="' + optionsForSlct[i].value +'" ';
        if(optionsForSlct[i].value == selectedValue) {
          tag += 'selected';
        }
        tag += '>' + optionsForSlct[i].text + '</option>';
      }
      tag += '</select>';
      return tag;
  }
  
  function deleteRow(id) {
      if($("#row_" + id).length == 0) {
        return;
      }
      if(!confirm("Are you sure you want to delete this branch?")) {
        return;
      }
      
      params["id"] = id
      if(id == "-1") {
        deleteSuccess(params);
      }
      else {
        deleteFromDB(id);
      }
  }

  function cancelEditRow(id) {
      if($("#row_" + id).length == 0) {
        return;
      }
      if(!confirm("Are you sure you want to cancel?")) {
        return;
      }
      
      if(id == -1) {
          $("#row_" + id).detach();
      }
      else {
        makeRowNonEditable(params);
      }
  }
  
  function editRow(id){
    if($("#name").length > 0) {
      alert("Please save or cancel the unsaved row");
      return;
    }
    
    params["id"] = id;
    $("#row_" + id).children("td").each(function(index){
        var value = $(this).html();
        if(index < properties.length) {
            if(properties[index].type != "select") {
               $(this).empty().append('<input type="' + properties[index].type + '" id="' + properties[index].name + '" class="form-control" maxLength="' + properties[index].maxLength + '" value="' + value + '" />');
            }else {
               $(this).empty().append(selectTag(optionsForSelect, value, properties[index]));
            }
            params[properties[index].name] = value;
        }
        else {
           $(this).empty().append('<a href="#" onclick="javascript:saveIntoDB(\'' + id + '\');return false;"><i class="glyphicon glyphicon-ok"/></a>&nbsp;<a href="#" onclick="javascript:cancelEditRow(\'' + id + '\');return false;"><i class="glyphicon glyphicon-remove"/></a>');
        }
    });
  }

  function saveIntoDB(id) {
    var type = "POST";
    var saveUrl = url;
    if(id != "-1") {
      saveUrl += "/" + id;
      type = "PUT";
    }
    saveUrl += ".json"
    loadParams();
    $.ajax({url: saveUrl,
        data: JSON.stringify(params), 
        contentType: "application/json", 
        type: type,
        dataType: "json"})
        .done(function(resdata){saveSuccess(resdata);})
        .fail(function(jqXHR){saveFailed(jqXHR)});
  } 
  
  function saveSuccess(data) {
      makeRowNonEditable(data);
  }

  function deleteFromDB(id) {
    var type = "DELETE";
    var deleteUrl = url + "/" + id + ".json";
    $.ajax({url: deleteUrl,
        contentType: "application/json", 
        type: type})
        .done(function(resdata){deleteSuccess(resdata);})
        .fail(function(jqXHR){saveFailed(jqXHR)});
  } 
  
  function deleteSuccess(data) {
       $("#row_" + data.id).detach();
  }
  
  function makeRowNonEditable(data) {
      if($("#row_" + data.id).length == 0) {
          if($("#row_-1").length == 0) {
            return;
          }
          $("#row_-1").attr("id", "row_" + data.id);
      }
      $("#row_" + data.id).children("td").each(function(index){
        if(index < properties.length) {        
            $(this).empty().text(data[properties[index].name]);
        }
        else {
           $(this).empty().append('<a href="#" onclick="javascript:editRow(\'' + data.id + '\');return false;"><i class="glyphicon glyphicon-edit"/></a>&nbsp;<a href="#" onclick="javascript:deleteRow(\'' + data.id + '\');return false;"><i class="glyphicon glyphicon-trash"/></a>');
        }
      });
  }
  
  function saveFailed(jqXHR) {
    if(typeof jqXHR.responseJSON.errors != "undefined") {
      var errMsg = '';
      for(var fld in jqXHR.responseJSON.errors) {
        if(jqXHR.responseJSON.errors.hasOwnProperty(fld)) {
          errMsg += jqXHR.responseJSON.errors[fld] + '\n';
        }
      }
      showError(errMsg);
    }
    else if(typeof jqXHR.responseJSON.message != "undefined") {
      console.log(jqXHR.responseJSON.message);
      showError(jqXHR.responseJSON.message);
    }
    else {
      console.log(jqXHR.responseText);
      showError('Internal Server Error');
    }
  }
  
    function getId(elementId) {
      var idComp = elementId.split("_");
      return idComp[1];
    }
    
      function allowAlphaNumeric(e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) || 
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if((e.keyCode >= 48 && e.keyCode <= 57) || (!e.shiftKey &&  e.keyCode >= 96 && e.keyCode <= 105)) {
          return;
        }
        if(e.keyCode >= 65 && e.keyCode <= 90) {
          return;
        }
        e.preventDefault();
  }

  function allowNumeric(e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) || 
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
          }
        // Ensure that it is a number and stop the keypress
        if((e.keyCode >= 48 && e.keyCode <= 57) || (!e.shiftKey &&  e.keyCode >= 96 && e.keyCode <= 105)) {
            return;
        }
        e.preventDefault();
  }
