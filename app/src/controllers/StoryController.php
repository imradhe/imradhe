<?php
class Story
{
    protected $storyID;
    protected $title;
    protected $author;
    protected $genre;
    protected $cover;
    protected $description;
    protected $tags;
    public $genres = ['literaryFiction', 'mystery', 'thriller', 'horror', 'historical', 'romance', 'western', 'scienceFiction', 'fantasy', 'dystopian', 'magicalRealism', 'realistLiterature', 'fable', 'fairyTale', 'fiction', 'historicalFiction', 'folklore', 'drama', 'humor', 'mythology', 'poetry', 'shortStory', 'essay', 'narrativeNonFiction', 'nonFiction', 'speech', 'romanticComedy' ];
    public $errors;

    public function __construct(){
        // Require Database
        require('db.php');

        // Database Instantiation
        $this->db = new mysqli($config['DB_HOST'],$config['DB_USERNAME'], $config['DB_PASSWORD'], $config['DB_DATABASE']);

        $this->errors = "";

    }
    
    public function validate($title, $storyID, $author, $genre, $cover, $description, $tags)
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
        
        
        //StoryID Validation
        
        $storyIDCheck = mysqli_num_rows($this->db->query("SELECT * FROM `stories` WHERE `storyID` = '$storyID'"));
        
        $storyIDPattern = "/^[a-z0-9]+(-+[a-z0-9]+)*$/";
        
        if($storyIDCheck){
            $errors['storyID'] = true;
            $errorMsgs['storyID'] = "Story ID already in use";
        }
        elseif(!preg_match($storyIDPattern, $storyID)){            
            $errors['storyID'] = true;
            $errorMsgs['storyID'] = "Invalid Story ID";
        }
        else{
            $errors['storyID'] = false;
            $errorMsgs['storyID'] = "";
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
        
        // Author Validation
        if(empty($author)){
            $errors['author'] = true;
            $errorMsgs['author'] = "Author can't be empty";
        }
        elseif(strlen($author)<=5){            
            $errors['author'] = true;
            $errorMsgs['author'] = "Author can't be less than 5 Characters";
        }
        else{
            $errors['author'] = false;
            $errorMsgs['author'] = "";
        }
            
        // genre Validation

        if(!in_array($genre, $this->genres)){            
            $errors['genre'] = true;
            $errorMsgs['genre'] = "Invalid Genre";
        }
        else{
            $errors['genre'] = false;
            $errorMsgs['genre'] = "";
        }
        
        // cover Validation
        if(empty($cover)){
            $errors['cover'] = true;
            $errorMsgs['cover'] = "Cover can't be empty";
        }
        else{
            $errors['cover'] = false;
            $errorMsgs['cover'] = "";
        }
        
        // description Validation
        if(empty($description)){
            $errors['description'] = true;
            $errorMsgs['description'] = "Description can't be empty";
        }
        elseif(strlen($description)<=20){            
            $errors['description'] = true;
            $errorMsgs['description'] = "Description can't be less than 20 Characters";
        }
        else{
            $errors['description'] = false;
            $errorMsgs['description'] = "";
        }
        
        // tags Validation
        if(empty($tags)){
            $errors['tags'] = true;
            $errorMsgs['tags'] = "Tags can't be empty";
        }
        elseif(count(explode(',', $tags)) < 4){            
            $errors['tags'] = true;
            $errorMsgs['tags'] = "Tags can't be less than 3";
        }
        else{
            $errors['tags'] = false;
            $errorMsgs['tags'] = "";
        }
        
        // Calculating error
        $error = false;
        foreach ($errors as $i) {
          $error += $i;  
        }
        return ['error'=>$error, 'errorMsgs'=>$errorMsgs];

    }
    
    
     public function validateForUpdate($title, $author, $genre, $cover, $description, $tags)
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
        
        // Author Validation
        if(empty($author)){
            $errors['author'] = true;
            $errorMsgs['author'] = "Author can't be empty";
        }
        elseif(strlen($author)<=5){            
            $errors['author'] = true;
            $errorMsgs['author'] = "Author can't be less than 5 Characters";
        }
        else{
            $errors['author'] = false;
            $errorMsgs['author'] = "";
        }
            
        // genre Validation

        if(!in_array($genre, $this->genres)){            
            $errors['genre'] = true;
            $errorMsgs['genre'] = "Invalid Genre";
        }
        else{
            $errors['genre'] = false;
            $errorMsgs['genre'] = "";
        }
        
        // cover Validation
        if(empty($cover)){
            $errors['cover'] = true;
            $errorMsgs['cover'] = "Cover can't be empty";
        }
        else{
            $errors['cover'] = false;
            $errorMsgs['cover'] = "";
        }
        
        // description Validation
        if(empty($description)){
            $errors['description'] = true;
            $errorMsgs['description'] = "Description can't be empty";
        }
        elseif(strlen($description)<=20){            
            $errors['description'] = true;
            $errorMsgs['description'] = "Description can't be less than 20 Characters";
        }
        else{
            $errors['description'] = false;
            $errorMsgs['description'] = "";
        }
        
        // tags Validation
        if(empty($tags)){
            $errors['tags'] = true;
            $errorMsgs['tags'] = "Tags can't be empty";
        }
        elseif(count(explode(',', $tags)) < 4){            
            $errors['tags'] = true;
            $errorMsgs['tags'] = "Tags can't be less than 3";
        }
        else{
            $errors['tags'] = false;
            $errorMsgs['tags'] = "";
        }
        
        // Calculating error
        $error = false;
        foreach ($errors as $i) {
          $error += $i;  
        }
        return ['error'=>$error, 'errorMsgs'=>$errorMsgs];

    }
    
    public function create($title, $storyID, $author, $genre, $cover, $description, $tags)
    {
    
      $this->storyID = trim(mysqli_real_escape_string($this->db, $storyID));
      $this->title = trim(mysqli_real_escape_string($this->db, $title));
      $this->author = trim(mysqli_real_escape_string($this->db, $author));
      $this->genre = trim(mysqli_real_escape_string($this->db, $genre));
      $this->cover = trim(mysqli_real_escape_string($this->db, $cover));
      $this->description = trim(mysqli_real_escape_string($this->db, $description));
      $this->tags = trim(mysqli_real_escape_string($this->db, $tags));
      $this->createdDate = date("Y-m-d h:i:s");
        
        $validate = $this->validate($this->title, $this->storyID, $this->author, $this->genre, $this->cover, $this->description, $this->tags);
           
        
        if($validate['error']) return ['error'=> $validate['error'],'errorMsgs'=>$validate['errorMsgs']];
        else{
            
            $createStory = $this->db->query("INSERT INTO `stories` (`storyID`,`title`,`author`,`genre`,`cover`,`description`,`tags`,`createdDate`) VALUES ('$this->storyID', '$this->title', '$this->author', '$this->genre', '$this->cover', '$this->description', '$this->tags', ' $this->createdDate')");
            
            if($createStory){
                $this->errorMsgs = null;
                $this->error = false;
                return [
                            "storyID" => $this->storyID,
                            "title" => $this->title,
                            "author" => $this->author,
                            "genre" => $this->genre,
                            "description" => $this->description,
                            "cover" => $this->cover,
                            "tags" => $this->tags,
                            "createdDate" => $this->createdDate
                       ];
            }
            else{
                $this->errorMsgs['createStory'] = 'Story Creation failed. '.$this->db->error;
                $this->error = true;
                return ['error'=> $this->error,'errorMsgs'=> $this->errorMsgs];
            }
            
        }
    }



    public function update($title, $storyID, $author, $genre, $cover, $description, $tags)
    {
    
      $this->storyID = trim(mysqli_real_escape_string($this->db, $storyID));
      $this->title = trim(mysqli_real_escape_string($this->db, $title));
      $this->author = trim(mysqli_real_escape_string($this->db, $author));
      $this->genre = trim(mysqli_real_escape_string($this->db, $genre));
      $this->cover = trim(mysqli_real_escape_string($this->db, $cover));
      $this->description = trim(mysqli_real_escape_string($this->db, $description));
      $this->tags = trim(mysqli_real_escape_string($this->db, $tags));
        
        $validate = $this->validateForUpdate($this->title, $this->author, $this->genre, $this->cover, $this->description, $this->tags);
           
        
        if($validate['error']) return ['error'=> $validate['error'],'errorMsgs'=>$validate['errorMsgs']];
        else{
            $this->updatedDate = date("Y-m-d h:i:s");
            $updateStory = $this->db->query("UPDATE `stories` SET `title` = '$this->title', `author` = '$this->author', `genre` = '$this->genre', `cover` = '$this->cover', `description` = '$this->description', `tags` = '$this->tags', `updatedDate` = '$this->updatedDate' WHERE `storyID` = '$this->storyID'");
            
            
            if($updateStory){
                $this->errorMsgs = null;
                $this->error = false;
                return [
                            "storyID" => $this->storyID,
                            "title" => $this->title,
                            "author" => $this->author,
                            "genre" => $this->genre,
                            "description" => $this->description,
                            "cover" => $this->cover,
                            "tags" => $this->tags,
                            "updatedDate" => $this->updatedDate,
                       ];
            }
            else{
                $this->errorMsgs['createStory'] = 'Story Updation failed. '.$this->db->error;
                $this->error = true;
                return ['error'=> $this->error,'errorMsgs'=> $this->errorMsgs];
            }
            
            
        
        }
    }
    
    
    public function getStory($storyID){
        $story = $this->db->query("SELECT * FROM stories where storyID = '$storyID'")->fetch_assoc();
        return $story;
    }
    
    public function getStories(){
        $stories = $this->db->query("SELECT * FROM stories");
        
        $allStories = [];
        foreach ($stories as $story){
            array_push($allStories, $story);
        }
        return $allStories;
    }
    public function delete($storyID){
        
        
        $deleteStory = $this->db->query("DELETE FROM `stories` WHERE `storyID` = '$storyID'");
        
        if($deleteStory){
            $this->error = false;
            $this->errorMsgs = null;
            
             return $storyID." Deleted Successsfully";
        }else{
            $this->error = true;
            $this->errorMsgs['deleteStory'] = 'Story Deletion Failed '.$this->db->error;
            return ['error'=> $this->error,'errorMsgs'=> $this->errorMsgs];
        }
            
    }

} 

