function validateContact(){
	
	var message = document.getElementById('message').value;
	var email = document.getElementById('email').value;
	var name = document.getElementById('name').value;
	
	var hasMessage = false;
	var hasEmail = false;
	var hasName = false;
	
	if (message == ''){
		alert("message required");
		return false;
	}
	else{
		hasMessage = true;
	}
	
	if (email == ''){
		alert("email required");
		return false;
	}
	else{
		hasEmail = true;
	}
	
	if (name == ''){
		alert("name required");
		return false;
	}
	else{
		hasName = true;
	}
	
	if (hasMessage && hasEmail && hasName)
		return true;
	else
		return false;
		
}

function validateDelete(){
	
	if (document.getElementById('id').value == ''){
		alert("id must be filled out");
		return false;
	}
	else{
		return true;
	}
}

function validateCreateItem(){
	
	var item = document.getElementById('item').value;
	var description = document.getElementById('description').value;
	var quantity = document.getElementById('quantity').value;
	
	var hasItem = false;
	var hasDescription = false;
	var hasQuantity = false;
	
	if (item == ''){
		alert("name required");
		return false;
	}
	else{
		hasItem = true;
	}
	
	if (description == ''){
		alert("description required");
		return false;
	}
	else{
		hasDescription = true;
	}
	
	if (quantity == ''){
		alert("quantity required");
		return false;
	}
	else{
		hasQuantity = true;
	}
	
	if (hasItem && hasDescription && hasQuantity)
		return true;
	else
		return false;
	
}

function validateReservation(){
	
	var first = document.getElementById('firstName').value;
	var last = document.getElementById('lastName').value;
	var email = document.getElementById('email').value;
	var phone = document.getElementById('phone').value;
	var amount = document.getElementById('amount').value;
	var date = document.getElementById('date').value;
	
	var hasFirst = false;
	var hasLast = false;
	var hasEmail = false;
	var hasPhone = false;
	var hasAmount = false;
	var hasDate = false;
	
	
	if (first == ''){
		alert("First Name required");
		return false;
	}
	else{
		hasFirst = true;
	}
	
	if (last == ''){
		alert("Last Name required");
		return false;
	}
	else{
		hasLast = true;
	}
	
	if (email == ''){
		alert("email required");
		return false;
	}
	else{
		hasEmail = true;
	}
	
	if (phone == ''){
		alert("phone number required");
		return false;
	}
	else{
		hasPhone = true;
	}
	
	if (amount == ''){
		alert("amount required");
		return false;
	}
	else{
		hasAmount = true;
	}
	
	if (date == ''){
		alert("Date required");
		return false;
	}
	else{
		hasDate = true;
	}
	
	
	if (hasFirst && hasLast && hasEmail && hasPhone && hasAmount && hasDate)
		return true;
	else
		return false;
}