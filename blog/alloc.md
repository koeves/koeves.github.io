---
layout: post
author: me
date: 2019-12-20
title: Writing a memory allocator in C
---

This post will go through some of the key aspects of memory allocator design, i.e. an implementation of the malloc function family.

## Step 1: Design
First let's gather some requirements that we want our allocator to have. 
We will implement four functions, malloc, calloc, realloc and free, whose prototypes are defined as follows:

```C
void *malloc(size_t size);
void *calloc(size_t nmemb, size_t size);
void *realloc(void *ptr, size_t size);
void free(void *ptr);
```

### malloc 
`void *malloc(size_t size);`
The main purpose of the function will be to grow the program heap, thus allocating at least size bytes. We will also align the memory to 8 bytes. 
After we grow the program heap, done by the `brk` family of functions, we also need to do some bookkeeping. Before each allocated chunk of memory, we will also attach a metadata struct, that will help us determine the size of the block, whether it's free or not, and it will also include a pointer to the next free block (to be discussed later in more detail).
The metadata struct will be defined as follows:

{% highlight c %}
struct block {
    size_t        size;
    char          free;
    struct block  *next_free;
}
{% endhighlight %}

### free
The function `free` should do the following things: 
- mark the block free that we pass to it
- merge blocks when the freed block's neighbour is also free
- maintain free list of blocks
- release memory back to the OS (in case when the freed block is right at the end of the program heap)

#### Sidenote: On void pointers
In this post you will encounter a lot of use of `void *` and pointer arithmetic. It is therefore important to set some things straight. 
If you haven't yet used void pointers, it is best to think of it as the *generic* pointer type. In order to perform arithmetic on pointers (i.e. arithmetic on memory addresses), the pointer needs to be of some *specific* pointer type, therefore a pointer of type `void *` will need to be *cast* to some specific type. Casting void pointers is safely promoted.
Let's say we have an array of 10 characters.
{% highlight c %}
char *str = malloc(10 * sizeof(char));
{% endhighlight %}
We can address the second element the following ways: `str[1]` or `str + 1`. The latter works, because we are adding exactly `sizeof(char)` bytes to `str`, i.e. the address of the first element of the array. Performing addition on pointers will work `SOMETYPE *POINTER + N = POINTER + N * SIZEOF(SOMETYPE)` as such. Note that an array will consist of a contiguous block of memory.
Back to void pointers. Let's say we have a chunk of memory `ptr` of type `void *`. We want to write a function that returns the struct that we have carefully located right next to this chunk of memory. In order for us to do that, we need to perform the following things: cast ptr to some specific type, then get back the (first) address of our metadata struct.
This can be done the following ways:

{% highlight c %}
// return address 1 * sizeof(struct block) to the left of ptr
return (struct block *)ptr - 1;

// or return address exactly sizeof(struct block) bytes to the left of ptr:
return (char *)ptr - sizeof(struct block);
{% endhighlight %}
In the latter case, we cast ptr to `char *` (which is 1 byte on most architectures), and then substract `sizeof(struct block)` bytes from the address.





