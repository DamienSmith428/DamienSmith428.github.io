#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 9020
#define TOKEN_FILE "/data/bluesphere/bluesphere.txt"

void ensure_dir(){
    system("mkdir -p /data/bluesphere");
}

void write_token(char *token){

    FILE *f = fopen(TOKEN_FILE,"w");

    if(!f) return;

    fprintf(f,"%s\n",token);

    fclose(f);
}

char* find_param(char *body,char *key){

    static char val[256];

    char *pos=strstr(body,key);

    if(!pos) return NULL;

    pos += strlen(key)+1;

    sscanf(pos,"%255[^&]",val);

    return val;
}

void handle_post(int client,char *buffer){

    char *body=strstr(buffer,"\r\n\r\n");

    if(!body) return;

    body+=4;

    char *token=find_param(body,"token");

    if(token){
        write_token(token);
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

    printf("Bluesphere token server running on %d\n",PORT);

    while(1){

        client=accept(server_fd,NULL,NULL);

        char buffer[4096]={0};

        recv(client,buffer,sizeof(buffer),0);

        if(strncmp(buffer,"POST ",5)==0){
            handle_post(client,buffer);
        }

        close(client);
    }

    return 0;
}
