# Git implementation


## Git from user perspective
- Git is a VCS. 
- All files that need to be tracked are organized into a
  repository. Repository is a directory on user FS. A new repository
  is created via `git init`
- When the user wants to create a version (or a snapshot) of the work,
  they should create a `commit`.
- Commits form a linked list of code versions.
- You can branch from commit list and form trees.
- User may call git commands from any folder inside a repository.

## Git internals
- All code versions and Git configuration is stored inside the repository's .git folder.
- All things that need to be tracked are organized into Git objects.
- Every Git object is stored inside `.git/objects`.
- Every Git object is adressable by SHA1 hash of its content.
- Git objects are stored like this: the first two characters of hash is a directory inside `.git/objects` and the rest is the file name inside that new directory.


## Git CLI

### git init
Create a new repository in some path.
To create a new repository you should create a .git directory there and put some git specific files:
- HEAD file
- config file, which is an INI configuration file
- branches directory
- refs/tags directory
- refs/heads directory
When creating a new repository we should check if there is already one.

## Git repository
Every repository consits of:
- Working directory, where the real files are stored. User sees and edits those files.
- Git direcotry: internal git directory.

There are also some functions to reference directories in .git.

## Finding git repository
Whenever the user types a git command the programm should locate the git repository (the user can be inside some working directory).
It is a recursive algorithm.

## Git objects
Git objects are... Git objects. The program should support 4 of them: blob, tree, commit, tag.
Every git object has 3 layers of representations:
1. Logical representation. It is a class that contains the data of the object. Its content for blob. Author, message for commit. And so on.
2. Serialized representation. Every git objects is converted to a string in such format: 'type size\0data'. Type is a string, then 
goes the size in ASCII numbers (human-readable), then the null character, and then the raw data of the object.
3. Compressed representation. The serialized representation is compressed using zlib. Then it is stored in .git/objects directory.
It's stored in a special way. At first, the SHA1 hash is computed from the serialized representation. Then the first two characters from
hash are separated. The two characters are the directory in .git/objects, and the rest is the name of the git object.

### Blob
It is a file. The data it stores is the real data of the file.