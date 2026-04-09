package com.group2.taskmanagement;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class WorkflowIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void userCanRegisterCreateWorkspaceCreateTaskAndComment() throws Exception {
        MockHttpSession session = new MockHttpSession();

        String registerResponse = mockMvc.perform(post("/api/auth/register")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Owner User",
                      "email": "owner@example.com",
                      "password": "secret123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("owner@example.com"))
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode userJson = objectMapper.readTree(registerResponse);
        String userId = userJson.get("id").asText();

        String workspaceResponse = mockMvc.perform(post("/api/workspaces")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Engineering",
                      "description": "Main team board"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.role").value("OWNER"))
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode workspaceJson = objectMapper.readTree(workspaceResponse);
        String workspaceId = workspaceJson.get("id").asText();

        String taskResponse = mockMvc.perform(post("/api/workspaces/" + workspaceId + "/tasks")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "Prepare sprint board",
                      "description": "Create initial backlog tasks",
                      "status": "TODO",
                      "priority": "HIGH",
                      "assigneeId": "%s"
                    }
                    """.formatted(userId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.title").value("Prepare sprint board"))
            .andReturn()
            .getResponse()
            .getContentAsString();

        JsonNode taskJson = objectMapper.readTree(taskResponse);
        String taskId = taskJson.get("id").asText();

        mockMvc.perform(put("/api/tasks/" + taskId)
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "title": "Prepare sprint board",
                      "description": "Create initial backlog tasks",
                      "status": "IN_PROGRESS",
                      "priority": "HIGH",
                      "assigneeId": "%s"
                    }
                    """.formatted(userId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("IN_PROGRESS"));

        mockMvc.perform(post("/api/tasks/" + taskId + "/comments")
                .session(session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "body": "Board is ready for review."
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authorName").value("Owner User"));

        mockMvc.perform(get("/api/tasks/" + taskId + "/comments").session(session))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].body").value("Board is ready for review."));
    }

    @Test
    void duplicateEmailIsRejectedCaseInsensitively() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "First User",
                      "email": "member@example.com",
                      "password": "secret123"
                    }
                    """))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Second User",
                      "email": "MEMBER@example.com",
                      "password": "secret123"
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message").value("Email is already in use"));
    }

    @Test
    void resetEndpointClearsUsersAndAllowsFreshRegistration() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Reset User",
                      "email": "reset@example.com",
                      "password": "secret123"
                    }
                    """))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/system/reset"))
            .andExpect(status().isNoContent());

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Reset User Again",
                      "email": "reset@example.com",
                      "password": "secret123"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("reset@example.com"));
    }
}
