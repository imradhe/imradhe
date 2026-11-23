<?php

class Flag
{
    protected $db;
    protected $taskID;
    protected $annotator;
    protected $reviewer;
    protected $superchecker;
    protected $flag;
    protected $segment;
    protected $role;
    public $errors;

    public function __construct(){
        // Require Database
        require('db.php');
        header("Content-Type: application/json");

        // Database Instantiation
        $this->db = new mysqli($config['DB_HOST'], $config['DB_USERNAME'], $config['DB_PASSWORD'], $config['DB_DATABASE']);

        $this->errors = [];
    }

public function flag($projectID, $taskID, $annotator, $reviewer, $superchecker, $flag, $segment, $role){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST");
    header("Access-Control-Allow-Headers: Content-Type");

    // Sanitize input
    $this->projectID = mysqli_real_escape_string($this->db, $projectID);
    $this->taskID = mysqli_real_escape_string($this->db, $taskID);
    $this->annotator = mysqli_real_escape_string($this->db, $annotator);
    $this->reviewer = mysqli_real_escape_string($this->db, $reviewer);
    $this->superchecker = mysqli_real_escape_string($this->db, $superchecker);
    $this->flag = mysqli_real_escape_string($this->db, $flag);
    $this->segment = mysqli_real_escape_string($this->db, $segment);
    $this->role = mysqli_real_escape_string($this->db, $role);
    
    // Insert log
    $currentTime = date('Y-m-d H:i:s');
    $insertLog = $this->db->query("INSERT INTO flags (`projectID`, `taskID`, `annotator`, `reviewer`, `superchecker`, `flag`, `segment`, `role`, `time`) VALUES ('$this->projectID','$this->taskID','$this->annotator','$this->reviewer','$this->superchecker','$this->flag','$this->segment','$this->role','$currentTime')");

    if($insertLog){
        return json_encode([ 
            'taskID' => $this->taskID,
            'message'=> 'Successful',
            'status' => 200
        ]);
    }
    else{
        $this->errors = "Internal Server Error\n\n".$this->db->error;
        return json_encode([ 
            'errors' => $this->errors,
            'message'=> 'Failed',
            'status' => 500
        ]);            
    }
}

    
    public function flags($role = ""){
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: GET");
        header("Access-Control-Allow-Headers: Content-Type");
        
        if(empty($role))
            $fetch = $this->db->query("SELECT * from flags");
        else
            $fetch = $this->db->query("SELECT $role, COUNT(*) AS flag_count FROM flags GROUP BY $role ORDER BY flag_count DESC;");

        $data = [];
        foreach ($fetch as $flag){
            array_push($data, $flag);
        }
        
        if($data){
            $this->errors = null;
        }
        else{
            $this->errors = "Data not found";
        }

        if(empty($this->errors)){
            return json_encode([ 
                'data' => $data,
                'message'=> 'Successful',
                'status' => 200
            ]);
        }
        else{            
            return json_encode([ 
                'errors' => $this->errors,
                'message'=> 'Failed'
            ]);            
        }
    }

    public function flags_supercheckers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");

    $fetch = $this->db->query("SELECT superchecker, COUNT(*) AS flag_count FROM flags GROUP BY superchecker ORDER BY flag_count DESC;");

    $data = [];
    foreach ($fetch as $flag){
        array_push($data, $flag);
    }

    if($data){
        $this->errors = null;
    }
    else{
        $this->errors = "Internal Server Error";
    }

    if(empty($this->errors)){
        return json_encode([ 
            'data' => $data,
            'message'=> 'Successful',
            'status' => 200
        ]);
    }
    else{            
        return json_encode([ 
            'errors' => $this->errors,
            'message'=> 'Failed'
        ]);            
    }
}

public function flags_reviewers() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");

    $fetch = $this->db->query("SELECT reviewer, COUNT(*) AS flag_count FROM flags GROUP BY reviewer ORDER BY flag_count DESC;");

    $data = [];
    foreach ($fetch as $flag){
        array_push($data, $flag);
    }

    if($data){
        $this->errors = null;
    }
    else{
        $this->errors = "Internal Server Error";
    }

    if(empty($this->errors)){
        return json_encode([ 
            'data' => $data,
            'message'=> 'Successful',
            'status' => 200
        ]);
    }
    else{            
        return json_encode([ 
            'errors' => $this->errors,
            'message'=> 'Failed'
        ]);            
    }
}


public function flags_annotators() {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");

    $fetch = $this->db->query("SELECT annotator, COUNT(*) AS flag_count FROM flags GROUP BY annotator ORDER BY flag_count DESC;");

    $data = [];
    foreach ($fetch as $flag){
        array_push($data, $flag);
    }

    if($data){
        $this->errors = null;
    }
    else{
        $this->errors = "Internal Server Error";
    }

    if(empty($this->errors)){
        return json_encode([ 
            'data' => $data,
            'message'=> 'Successful',
            'status' => 200
        ]);
    }
    else{            
        return json_encode([ 
            'errors' => $this->errors,
            'message'=> 'Failed'
        ]);            
    }
}

public function flags_superchecker($email) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");

    $fetch = $this->db->query("SELECT * FROM flags WHERE superchecker = '$email' ");

    $data = [];
    foreach ($fetch as $flag){
        array_push($data, $flag);
    }

    if($data){
        $this->errors = null;
    }
    else{
        $this->errors = "Internal Server Error";
    }

    if(empty($this->errors)){
        return json_encode([ 
            'data' => $data,
            'message'=> 'Successful',
            'status' => 200
        ]);
    }
    else{            
        return json_encode([ 
            'errors' => $this->errors,
            'message'=> 'Failed'
        ]);            
    }
}


public function flags_reviewer($email) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");

    $fetch = $this->db->query("SELECT * FROM flags WHERE reviewer = '$email' ");

    $data = [];
    foreach ($fetch as $flag){
        array_push($data, $flag);
    }

    if($data){
        $this->errors = null;
    }
    else{
        $this->errors = "Internal Server Error";
    }

    if(empty($this->errors)){
        return json_encode([ 
            'data' => $data,
            'message'=> 'Successful',
            'status' => 200
        ]);
    }
    else{            
        return json_encode([ 
            'errors' => $this->errors,
            'message'=> 'Failed'
        ]);            
    }
}


public function flags_annotator($email) {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET");
    header("Access-Control-Allow-Headers: Content-Type");

    $fetch = $this->db->query("SELECT * FROM flags WHERE annotator ='$email' ");

    $data = [];
    foreach ($fetch as $flag){
        array_push($data, $flag);
    }

    if($data){
        $this->errors = null;
    }
    else{
        $this->errors = "Internal Server Error";
    }

    if(empty($this->errors)){
        return json_encode([ 
            'data' => $data,
            'message'=> 'Successful',
            'status' => 200
        ]);
    }
    else{            
        return json_encode([ 
            'errors' => $this->errors,
            'message'=> 'Failed'
        ]);            
    }
}


}
