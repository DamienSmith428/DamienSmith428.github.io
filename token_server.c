#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 9020

#define TOKEN_FILE "/data/bluesphere/bluesphere.txt"
#define DB_FILE "/data/bluesphere/tokens.db"

void ensure_dirs()
{
system("mkdir -p /data/bluesphere");
}

void write_active_token(char *token)
{
FILE *f = fopen(TOKEN_FILE,"w");

```
if(!f) return;

fprintf(f,"%s\n",token);

fclose(f);
```

}

void add_token(char *name,char *token)
{
FILE *f=fopen(DB_FILE,"a");

```
if(!f) return;

fprintf(f,"%s|%s\n",name,token);

fclose(f);
```

}

void delete_token(char *token)
{
FILE *f=fopen(DB_FILE,"r");

```
if(!f) return;

FILE *tmp=fopen("/data/bluesphere/tmp.db","w");

char line[512];

while(fgets(line,sizeof(line),f))
{
    if(strstr(line,token)==NULL)
    fprintf(tmp,"%s",line);
}

fclose(f);
fclose(tmp);

rename("/data/bluesphere/tmp.db",DB_FILE);
```

}

void send_tokens(int client)
{
FILE *f=fopen(DB_FILE,"r");

```
char buffer[4096];

strcpy(buffer,"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n[");

if(f)
{
    char line[512];
    int first=1;

    while(fgets(line,sizeof(line),f))
    {
        char *name=strtok(line,"|");
        char *token=strtok(NULL,"\n");

        if(!first) strcat(buffer,",");

        strcat(buffer,"{\"name\":\"");
        strcat(buffer,name);
        strcat(buffer,"\",\"token\":\"");
        strcat(buffer,token);
        strcat(buffer,"\"}");

        first=0;
    }

    fclose(f);
}

strcat(buffer,"]");

send(client,buffer,strlen(buffer),0);
```

}

char *get_param(char *data,char *key)
{
static char value[256];

```
char *pos=strstr(data,key);

if(!pos) return NULL;

pos+=strlen(key)+2;

sscanf(pos,"%[^\"]",value);

return value;
```

}

void handle_post(int client,char *data,char *path)
{
if(strcmp(path,"/add")==0)
{
char *name=get_param(data,"name");
char *token=get_param(data,"token");

```
    if(name && token)
    add_token(name,token);
}

if(strcmp(path,"/set")==0)
{
    char *token=get_param(data,"token");

    if(token)
    write_active_token(token);
}

if(strcmp(path,"/delete")==0)
{
    char *token=get_param(data,"token");

    if(token)
    delete_token(token);
}

send(client,"HTTP/1.1 200 OK\r\n\r\nOK",19,0);
```

}

int main()
{
ensure_dirs();

```
int server_fd,client;

struct sockaddr_in addr;

server_fd=socket(AF_INET,SOCK_STREAM,0);

addr.sin_family=AF_INET;
addr.sin_addr.s_addr=INADDR_ANY;
addr.sin_port=htons(PORT);

bind(server_fd,(struct sockaddr*)&addr,sizeof(addr));

listen(server_fd,10);

printf("Token server running on port %d\n",PORT);

while(1)
{
    client=accept(server_fd,NULL,NULL);

    char buffer[8192]={0};

    recv(client,buffer,sizeof(buffer),0);

    if(strncmp(buffer,"GET /tokens",11)==0)
    {
        send_tokens(client);
    }
    else if(strncmp(buffer,"POST ",5)==0)
    {
        char path[64];

        sscanf(buffer,"POST %s",path);

        handle_post(client,buffer,path);
    }

    close(client);
}

return 0;
```

}
