---
layout: post
author: me
date: 2019-12-20
download-pdf-url: alloc.pdf
title: Writing a memory allocator in C
---

This post will go through some of the key aspects of memory allocator design, i.e. an implementation of the malloc function family.

## Step 1: Basic functionality
First let's gather some requirements that we want our allocator to have. 
We will implement four functions, malloc, calloc, realloc and free, whose prototypes are defined as follows:

```c
void *malloc(size_t size);
void *calloc(size_t nmemb, size_t size);
void *realloc(void *ptr, size_t size);
void free(void *ptr);
```

### malloc 
The main purpose of the function will be to grow the program heap, thus allocating at least size bytes. We will also align the memory to 8 bytes. 
After we grow the program heap, done by the `brk` family of functions, we also need to do some bookkeeping. Before each allocated chunk of memory, we will also attach a metadata struct, that will help us determine the size of the block, whether it's free or not, and it will also include a pointer to the next free block (to be discussed later in more detail).
The metadata struct will be defined as follows:

```c
struct block {
    size_t        size;
    char          free;
    struct block  *next_free;
}
```

Now that we are at it, let's also define some macros, whose use will become evident later.
```c
#define  ALIGN_SIZE  sizeof(long)
#define  BLOCK_SIZE  sizeof(struct block)
```
We can now write a basic `malloc` function by piecing together the following things:
- define a metadata struct
- calculate the actual byte-aligned size that we'll use (i.e. the size should be evenly divisible by 8, as agreed upon)
- use the function [void *sbrk(intptr_t increment)](https://linux.die.net/man/2/sbrk) that will grow the program's data space by `increment` bytes. The returned `void *`, which is the first address of the newly allocated space, will be assigned to our metadata struct, unless the return value is `(void *)-1`, in that case we will throw an error
- return the first address of the free chunk, that is, `sizeof(struct block)` bytes away from the (first) address of the metadata struct

#### Sidenote: On void pointers and arithmetic
In this post you will encounter a lot of use of `void *` and pointer arithmetic. It is therefore important to set some things straight. 
If you haven't yet used void pointers, it is best to think of it as the *generic* pointer type. In order to perform arithmetic on pointers (i.e. arithmetic on memory addresses), the pointer needs to be of some *specific* pointer type, therefore a pointer of type `void *` will need to be *cast* to some specific type. Casting void pointers is safely promoted.
As an example, let's say we have an array of 10 characters.
```c
char *str = malloc(10 * sizeof(char));
```
We can address the second element the following ways: `str[1]` or `str + 1`. The latter works, because we are adding exactly `sizeof(char)` bytes to `str`, i.e. the address of the first element of the array. 
Performing addition on pointers will work as such:
```
POINTER + N = POINTER + N * SIZEOF(POINTER.TYPE)
```
(i.e. adding the number `N` to a pointer increments it by `N` times the size of the type `POINTER` points to). 
Note that an array will consist of a contiguous block of memory.

Back to void pointers. Let's say we have a chunk of memory `ptr` of type `void *`. We want to write a function that returns the struct that we have carefully located right next to this chunk of memory. In order for us to do that, we need to perform the following things, combining the things previously said about casting and arithmetic: cast ptr to some specific type, then get back the (first) address of our metadata struct, and finally, cast the whole thing to be of type `struct block *` like so:
```c
/*
 * return address exactly sizeof(struct block) bytes to the left of ptr
 */
struct block *get_block(void *ptr) 
{
    return (struct block *)((char *)ptr - sizeof(struct block));
}
```
We cast ptr to `char *` (which is 1 byte on most architectures), and then substract `sizeof(struct block)` bytes from the address.

#### Back to malloc now. 
Let's combine the things previously listed and our refreshed knowledge of void pointers:
```c
void *malloc(size_t size)
{
    struct block *current = NULL;
    size_t aligned_size = (size % 8 > 0) ? (size + (ALIGN_SIZE - (size % ALIGN_SIZE)) + BLOCK_SIZE) : (size + BLOCK_SIZE);
    
    if ((current = sbrk(aligned_size)) == (void *)-1) 
        perror("sbrk");
    
    current->free = 0;
    current->size = aligned_size - BLOCK_SIZE;
    current->next_free = NULL;
    
    return (char *)current + BLOCK_SIZE;
}
```

### free
The function `free` should do the following things: 

Basic functionality:
- mark the block free that we pass to it
- maintain free list of blocks

Extras:
- merge blocks when the freed block's neighbour is also free
- release memory back to the OS (in case when the freed block is right at the end of the program heap)

#### Basic functionality
Combining the little `struct block *get_block(void *)` function we wrote just before, we can now mark a chunck of memory free by first getting the actual struct next to the block of memory, then setting the `free` bit to 1.
```c
void free(void *ptr)
{  
    struct block *current_block = get_block(ptr);
    current_block->free = 1;
    
    /* ... */
}
```
Fine. Although, in order to actually reuse a freed chunk, we do need to do some maintaining. Let's start by defining two global metadata struct pointers that will keep track of our free list's tail and head.
```c
struct block *free_head = NULL, *free_tail = NULL;
```
We can now assign the current freed block (well, the struct next to it) to `free_tail`, and point the previous tail to the current one.
```c
void free(void *ptr)
{
    struct block *current_block = get_block(ptr);
    current_block->free = 1;
    
    if (!free_head)
        free_head = current_block;
    
    if (tail)
        tail->next_free = current_block;
    
    free_tail = current_block;
    
    /* ... */
}
```

Let's reuse some blocks now, shall we?

### malloc 2.0
In the previous chapter or so, we've created our free list of blocks. These blocks of course won't be reused unless we specifically do something about it. 
First of all, we'll write a small function that loops through the freelist, and either returns the block if a fitting one is found, or `NULL`.
```c
struct block *get_free_block(size_t size)
{
    struct block *current = free_head;
    
    while (current) {
        if (!current)
            break;
        
        if ((current->size >= size) && (curr->free))
            return current;
        
        current = current->next_free;
    }
    
    return NULL;
}
```

Second, when we found a suitable block to reuse, we need to do some maintaining on our freelist. When a have singly-linked list of free blocks, what scenarios might occur when we try to unlink a block?

- free_head equals to free_tail (and therefore, the current reused block as well)
- free_tail equals to current block
- free_head equals to current block
- current block is neither the above (i.e. current block is inbetween two other free blocks)

We need to take care all of the above points.

```c
void maintain_freelist(struct block *current)
{
    if (free_head == free_tail) {
        free_head = free_tail = NULL;
        current->next_free = NULL;
    }
    else if (free_head == current) {
        free_head = free_head->next_free;
        current->next_free = NULL;
    }
    else if (free_tail == current) {
        struct block *prev = free_head;
        while (prev) {
            if (prev->next_free == free_tail)
                break;
            prev = prev->next_free;
        }
        free_tail = prev;
    }
    else {
        struct block *prev = free_head;
        while (prev) {
            if (prev->next_free == current)
                break;   
            prev = prev->next_free;
        }
        prev->next_free = current->next_free;
        current->next_free = NULL;
    }
}
```

And finally, let's combine these two functions into our `malloc`.
```c
void *malloc(size_t size)
{
    struct block *current = NULL;
    size_t aligned_size = (size % 8 > 0) ? (size + (ALIGN_SIZE - (size % ALIGN_SIZE)) + BLOCK_SIZE) : (size + BLOCK_SIZE);
    
    if ((current = get_free_block(size))) {
        maintain_freelist(current);
    }
    else {
        if ((current = sbrk(aligned_size)) == (void *)-1) 
            perror("sbrk");
            
        current->size = aligned_size - BLOCK_SIZE;
        current->next_free = NULL;
    }
    
    current->free = 0;
   
    return (char *)current + BLOCK_SIZE;
}
```
