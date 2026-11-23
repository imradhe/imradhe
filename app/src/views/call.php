<?php
// Check if the phone number is provided via GET parameter
if (isset($_GET['phone'])) {
    // Get the phone number from the GET parameter
    $phone_number = $_GET['phone'];

    // Sanitize the phone number to ensure it's in the correct format (optional, for security)
    $phone_number = preg_replace('/[^0-9+]/', '', $phone_number); // Removes all characters except digits and +

    // Redirect to the tel: link
    header("Location: tel:" . $phone_number);
    exit();
} else {
    // If no phone number is provided, display an error message
    echo "No phone number provided.";
}
?>
