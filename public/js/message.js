function showSuccess(message) {
    if($('#divMessage').length > 0) {
        showMessage(message, 'success');
    }
    else {
        alert(message);
    }
}

function showError(message) {
    if($('#divMessage').length > 0) {
        showMessage(formatMessage(message), 'error');
    }
    else {
        alert(message);
    }
}

function showMessage(message, type) {
    if(!message || message.length == 0) {
        return;
    }
    var msgHtml = '<div class="alert ' + getAlertClass(type) + ' alert-dismissable">'
                    + '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'
                    + '<strong>' + getAlertTitle(type) + '</strong> <span>' + message + '</span>'
                    + '</div>';
    $('#divMessage').empty().append(msgHtml);
}

function formatMessage(message) {
    return message.replace(/\n/g, "<br/>");
}

function getAlertClass(type) {
    if(type == 'alert') {
        return 'alert-warning';
    }
    else if(type == 'info') {
        return 'alert-info';
    }
    else if(type == 'error') {
        return 'alert-danger';
    }
    else if(type == 'success') {
        return 'alert-success';
    }
    else {
        return '';
    }
}

function getAlertTitle(type) {
    if(type == 'alert') {
        return 'Warning!';
    }
    else if(type == 'info') {
        return 'Info!';
    }
    else if(type == 'error') {
        return 'Error!';
    }
    else if(type == 'success') {
        return 'Success!';
    }
    else {
        return '';
    }
}