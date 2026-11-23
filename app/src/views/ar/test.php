<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Google Form in Bootstrap Modal</title>
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>

<div class="container">
    <h2>Click the button to open the form</h2>
    <!-- Button to Open the Modal -->
    <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#googleFormModal">
        Open Form
    </button>
</div>
<!-- The Modal -->
<div class="modal fade" id="googleFormModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">Submit Your Details</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <!-- Form Start -->
        <form id="googleForm">
          <div class="form-group">
            <label for="name">Are you attending?</label>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="entry.877086558" id="yes" value="yes" required>
                <label class="form-check-label" for="yes">
                    Yes, I'll be there
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="entry.877086558" id="no" value="no" required>
                <label class="form-check-label" for="no">
                    Sorry, can't make it
                </label>
            </div>
          </div>
          <div class="form-group">
            <label for="phone">What's your mobile number (WhatsApp)?</label>
            <input type="phone" class="form-control" id="phone" name="entry.850950014" required>
          </div>
          <div class="form-group">
            <label for="people">What are the names of people attending? <small>(Add it line by line)</small></label>
            <textarea class="form-control" id="people" name="entry.1498135098" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="message">Comments and/or questions</label>
            <textarea class="form-control" id="message" name="entry.2606285" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Submit</button>
        </form>
        <!-- Form End -->
        <div id="formStatus" class="mt-3" style="display: none;">
            <div class="alert alert-success" role="alert">
              Thank you for your submission!
            </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Bootstrap JS, Popper.js, and jQuery -->
<script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
<script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

<script>
$(document).ready(function(){
    $('#googleForm').on('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission
        var formURL = 'https://docs.google.com/forms/d/e/1FAIpQLSc_w7T7ztLrmSMObv49aYDliSRRWvmHMk6Xs0sJjyl2A_86Ig/formResponse';
        $.ajax({
            url: formURL,
            data: $(this).serialize(),
            type: 'POST',
            dataType: 'xml',
            statusCode: {
                0: function () {
                    // Success message or any other logic
                    $('#googleForm').hide();
                    $('#formStatus').show();
                },
                200: function () {
                    // Success message or any other logic
                    $('#googleForm').hide();
                    $('#formStatus').show();
                }
            }
        });
    });
});
</script>

</body>
</html>
