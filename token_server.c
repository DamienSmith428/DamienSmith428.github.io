#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>

#define PORT 9020
#define TOKEN_FILE "/data/bluesphere/bluesphere.txt"

void write_token(char *token)
{
    FILE *f = fopen(TOKEN_FILE, "w");

    if (!f)
    {
        printf("Failed to open token file\n");
        return;
    }

    fprintf(f,"%s\n",token);
    fclose(f);

    printf("Token written: %s\n",token);
}

int main()
{
    int server_fd, client;
    struct sockaddr_in addr;

    server_fd = socket(AF_INET, SOCK_STREAM, 0);

    addr.sin_family = AF_INET;
    addr.sin_addr.s_addr = INADDR_ANY;
    addr.sin_port = htons(PORT);

    bind(server_fd,(struct sockaddr*)&addr,sizeof(addr));
    listen(server_fd,10);

    printf("Server running on port %d\n",PORT);

    while(1)
    {
        client = accept(server_fd,NULL,NULL);

        char buffer[4096];
        memset(buffer,0,sizeof(buffer));

        recv(client,buffer,sizeof(buffer),0);

        printf("Request:\n%s\n",buffer);

        char *body = strstr(buffer,"\r\n\r\n");

        if(body)
        {
            body += 4;

            char token[256];

            sscanf(body,"token=%255s",token);

            write_token(token);
        }

        send(client,"HTTP/1.1 200 OK\r\n\r\nOK",19,0);

        close(client);
    }

    return 0;
}
