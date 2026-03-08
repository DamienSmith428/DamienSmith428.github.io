#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 9020
#define TOKEN_FILE "/data/bluesphere/bluesphere.txt"
#define DB_FILE "/data/bluesphere/tokens.db"

void ensure_dir(){
system("mkdir -p /data/bluesphere");
}

void write_token(char *token){
FILE *f=fopen(TOKEN_FILE,"w");
if(!f)return;
fprintf(f,"%s\n",token);
fclose(f);
}

void add_token(char *name,char *token){
FILE *f=fopen(DB_FILE,"a");
if(!f)return;
fprintf(f,"%s|%s\n",name,token);
fclose(f);
}

void delete_token(char *token){

FILE *f=fopen(DB_FILE,"r");
if(!f)return;

FILE *tmp=fopen("/data/bluesphere/tmp.db","w");

char line[512];

while(fgets(line,sizeof(line),f)){

if(strstr(line,token)==NULL)
fprintf(tmp,"%s",line);

}

fclose(f);
fclose(tmp);

rename("/data/bluesphere/tmp.db",DB_FILE);
}

void send_tokens(int client){

FILE *f=fopen(DB_FILE,"r");

char response[4096];

strcpy(response,"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n[");

if(f){

char line[512];
int first=1;

while(fgets(line,sizeof(line),f)){

char *name=strtok(line,"|");
char *token=strtok(NULL,"\n");

if(!first)strcat(response,",");

strcat(response,"{"name":"");
strcat(response,name);
strcat(response,"","token":"");
strcat(response,token);
strcat(response,""}");

first=0;
}

fclose(f);

}

strcat(response,"]");

send(client,response,strlen(response),0);
}

char* find_param(char *body,char *key){

static char val[256];

char *pos=strstr(body,key);

if(!pos)return NULL;

pos+=strlen(key)+1;

sscanf(pos,"%[^&]",val);

return val;
}

void handle_post(int client,char *buffer,char *path){

char *body=strstr(buffer,"\r\n\r\n");

if(!body)return;

body+=4;

if(strcmp(path,"/add")==0){

char *name=find_param(body,"name");
char *token=find_param(body,"token");

if(name && token)
add_token(name,token);

}

if(strcmp(path,"/set")==0){

char *token=find_param(body,"token");

if(token)
write_token(token);

}

if(strcmp(path,"/delete")==0){

char *token=find_param(body,"token");

if(token)
delete_token(token);

}

send(client,"HTTP/1.1 200 OK\r\n\r\nOK",19,0);
}

int main(){

ensure_dir();

int server_fd,client;

struct sockaddr_in addr;

server_fd=socket(AF_INET,SOCK_STREAM,0);

addr.sin_family=AF_INET;
addr.sin_addr.s_addr=INADDR_ANY;
addr.sin_port=htons(PORT);

bind(server_fd,(struct sockaddr*)&addr,sizeof(addr));

listen(server_fd,10);

printf("Token server running on port %d\n",PORT);

while(1){

client=accept(server_fd,NULL,NULL);

char buffer[8192]={0};

recv(client,buffer,sizeof(buffer),0);

if(strncmp(buffer,"GET /tokens",11)==0){

send_tokens(client);

}

else if(strncmp(buffer,"POST ",5)==0){

char path[64];

sscanf(buffer,"POST %s",path);

handle_post(client,buffer,path);

}

close(client);

}

return 0;
}
