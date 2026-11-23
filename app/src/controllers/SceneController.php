<?php
class Scene
{
    protected $scenID;
    protected $title;
    protected $actNumber;
    protected $chapterNumber;
    protected $sceneNumber;
    protected $storyID;
    protected $content;
    protected $createdDate;
    protected $modifiedDate;
    public $errors;

    public function __construct(){
        // Require Database
        require('db.php');

        // Database Instantiation
        $this->db = new mysqli($config['DB_HOST'],$config['DB_USERNAME'], $config['DB_PASSWORD'], $config['DB_DATABASE']);

        $this->errors = "";

    }
    
    public function validate($sceneID, $title, $actNumber, $chapterNumber, $sceneNumber, $storyID, $content)
    {
        
        //sceneID Validation
        
        $sceneIDCheck = mysqli_num_rows($this->db->query("SELECT * FROM `scenes` WHERE `sceneID` = '$sceneID'"));
        
        $sceneIDPattern = "/^[a-z0-9]+(-+[a-z0-9]+)*$/";
        
        if($sceneIDCheck){
            $errors['sceneID'] = true;
            $errorMsgs['sceneID'] = "Scene ID already in use";
        }
        elseif(!preg_match($sceneIDPattern, $sceneID)){            
            $errors['sceneID'] = true;
            $errorMsgs['sceneID'] = "Invalid Scene ID";
        }
        else{
            $errors['sceneID'] = false;
            $errorMsgs['sceneID'] = "";
        }
        
        
        // Title Validation
        if(empty($title)){
            $errors['title'] = true;
            $errorMsgs['title'] = "Title can't be empty";
        }
        elseif(strlen($title)<=5){            
            $errors['title'] = true;
            $errorMsgs['title'] = "Title can't be less than 5 Characters";
        }
        else{
            $errors['title'] = false;
            $errorMsgs['title'] = "";
        }
        
        
         // Act Number Validation
        if(!(string)strlen($actNumber)){
            $errors['actNumber'] = true;
            $errorMsgs['actNumber'] = "Act Number can't be empty";
        }
        else{
            $errors['actNumber'] = false;
            $errorMsgs['actNumber'] = "";
        }

        
        // chapter Number Validation
        if(!(string)strlen($chapterNumber)){
            $errors['chapterNumber'] = true;
            $errorMsgs['chapterNumber'] = "Chapter Number can't be empty";
        }
        else{
            $errors['chapterNumber'] = false;
            $errorMsgs['chapterNumber'] = "";
        }

        
        // scene Number Validation
        if(!(string)strlen($sceneNumber)){
            $errors['sceneNumber'] = true;
            $errorMsgs['sceneNumber'] = "Scene Number can't be empty";
        }
        else{
            $errors['sceneNumber'] = false;
            $errorMsgs['sceneNumber'] = "";
        }
        
        
        $story = new Story;
        $story = $this->db->query("SELECT * FROM stories where storyID = '$storyID'")->fetch_assoc();
        
        // Story ID Validation
        if(empty($story)){
            $errors['storyID'] = true;
            $errorMsgs['storyID'] = "Story can't be empty";
        }
        else{
            $errors['storyID'] = false;
            $errorMsgs['storyID'] = "";
        }
        
        // Content Number Validation
        if(empty($content)){
            $errors['content'] = true;
            $errorMsgs['content'] = "Content can't be empty";
        }
        else{
            $errors['content'] = false;
            $errorMsgs['content'] = "";
        }
        
        
        // Calculating error
        $error = false;
        foreach ($errors as $i) {
          $error += $i;  
        }
        return ['error'=>$error, 'errorMsgs'=>$errorMsgs];

    }
    
    
     public function validateForUpdate($title, $content)
    {
         // Title Validation
        if(empty($title)){
            $errors['title'] = true;
            $errorMsgs['title'] = "Title can't be empty";
        }
        elseif(strlen($title)<=5){            
            $errors['title'] = true;
            $errorMsgs['title'] = "Title can't be less than 5 Characters";
        }
        else{
            $errors['title'] = false;
            $errorMsgs['title'] = "";
        }
        
        // Content Number Validation
        if(empty($content)){
            $errors['content'] = true;
            $errorMsgs['content'] = "Content can't be empty";
        }
        else{
            $errors['content'] = false;
            $errorMsgs['content'] = "";
        }
        
        
        // Calculating error
        $error = false;
        foreach ($errors as $i) {
          $error += $i;  
        }
        return ['error'=>$error, 'errorMsgs'=>$errorMsgs];

    }
    
    public function create($title, $actNumber, $chapterNumber, $sceneNumber, $storyID, $content)
    {
    
      $this->title = trim(mysqli_real_escape_string($this->db, $title));
      $this->storyID = trim(mysqli_real_escape_string($this->db, $storyID));$this->storyID = trim(mysqli_real_escape_string($this->db, $storyID));
      $this->actNumber = (string) trim(mysqli_real_escape_string($this->db, $actNumber));
      $this->chapterNumber = (string) trim(mysqli_real_escape_string($this->db, $chapterNumber));
      $this->sceneNumber = (string) trim(mysqli_real_escape_string($this->db, $sceneNumber));
      $this->content = addslashes(mysqli_real_escape_string($this->db, $content));
      $this->sceneID = $this->storyID.'-'.$this->actNumber.'-'.$this->chapterNumber.'-'.$this->sceneNumber;
      $this->createdDate = date("Y-m-d h:i:s");
        
        $validate = $this->validate($this->sceneID, $this->title, $this->actNumber, $this->chapterNumber, $this->sceneNumber, $this->storyID, $this->content);
           
         
        if($validate['error']) return ['error'=> $validate['error'],'errorMsgs'=>$validate['errorMsgs']];
        else{
            
            
            $createScene = $this->db->query("INSERT INTO `scenes` (`storyID`,`sceneID`,`title`,`actNumber`,`chapterNumber`,`sceneNumber`,`content`,`createdDate`) VALUES ('$this->storyID', '$this->sceneID', '$this->title', '$this->actNumber', '$this->chapterNumber', '$this->sceneNumber', '$this->content', ' $this->createdDate')");
            
            if($createScene){
                $this->errorMsgs = null;
                $this->error = false;
                return [
                           "sceneID" => $this->sceneID,
                           "title" => $this->title,
                           "actNumber" => $this->actNumber,
                           "chapterNumber" => $this->chapterNumber,
                           "sceneNumber" => $this->sceneNumber,
                           "storyID" => $this->storyID,
                           "content" => $this->content,
                           "createdDate" => $this->createdDate
                       ];
            }
            else{
                $this->errorMsgs['createScene'] = 'Scene Creation failed. '.$this->db->error;
                $this->error = true;
                return ['error'=> $this->error,'errorMsgs'=> $this->errorMsgs];
            }
            
        }
    }



    public function update($sceneID, $title, $content)
    {
    
      $this->sceneID = trim(mysqli_real_escape_string($this->db, $sceneID));
      $this->title = trim(mysqli_real_escape_string($this->db, $title));
      $this->content = addslashes(mysqli_real_escape_string($this->db, $content));
      $this->modifiedDate = date("Y-m-d h:i:s");
      
      $validate = $this->validateForUpdate($this->title, $this->content);
           
        
        if($validate['error']) return ['error'=> $validate['error'],'errorMsgs'=>$validate['errorMsgs']];
        else{
            $this->modifiedDate = date("Y-m-d h:i:s");
            $updateStory = $this->db->query("UPDATE `scenes` SET `title` = '$this->title', `content` = '$this->content',  `modifiedDate` = '$this->modifiedDate' WHERE `sceneID` = '$this->sceneID'");
            
            
            if($updateStory){
                $this->errorMsgs = null;
                $this->error = false;
                return [
                           "sceneID" => $this->sceneID,
                           "title" => $this->title,
                           "content" => $this->content,
                            "modifiedDate" => $this->modifiedDate,
                       ];
            }
            else{
                $this->errorMsgs['createStory'] = 'Scene Updation failed. '.$this->db->error;
                $this->error = true;
                return ['error'=> $this->error,'errorMsgs'=> $this->errorMsgs];
            }
            
            
        
        }
    }
    
    
    
    public function getLatest(){
        $scene = $this->db->query("SELECT * FROM scenes where createdDate = (SELECT min(createdDate) FROM scenes)")->fetch_assoc();
        return $scene;
    }
    
    public function getScene($sceneID){
        
        $scene = $this->db->query("SELECT * FROM scenes where sceneID = '$sceneID'")->fetch_assoc();
        return $scene;
    }
    
    public function getScenes(){
      $scenes = $this->db->query("SELECT * FROM scenes");
      
      $allScenes = [];
      foreach ($scenes as $scene){
          array_push($allScenes, $scene);
      }
      return $allScenes;
    }    
    
    public function delete($sceneID){
        
        
        $deleteScene = $this->db->query("DELETE FROM `scenes` WHERE `sceneID` = '$sceneID'");
        
        if($deleteScene){
            $this->error = false;
            $this->errorMsgs = null;
            
             return $sceneID." Deleted Successsfully";
        }else{
            $this->error = true;
            $this->errorMsgs['deleteScene'] = 'Scene Deletion Failed '.$this->db->error;
            return ['error'=> $this->error,'errorMsgs'=> $this->errorMsgs];
        }
            
    }

} 

