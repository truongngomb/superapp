import PocketBase from 'pocketbase';
import { swVideoProjectsCollection } from '../collections/sw_video_projects.collection.js';
import { swVideoScenesCollection } from '../collections/sw_video_scenes.collection.js';

export async function migrateVideoProjects() {
  const pb = new PocketBase(process.env.POCKETBASE_URL);
  
  // Authenticate as admin
  console.log('Authenticating with PocketBase...');
  await pb.collection('_superusers').authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL!,
    process.env.POCKETBASE_ADMIN_PASSWORD!
  );

  console.log('🚀 Starting migration: video_projects → sw_video_projects');

  try {
    // 1. Create sw_video_projects
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await pb.collections.create(swVideoProjectsCollection as any);
      console.log('✅ Created collection: sw_video_projects');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.status === 400 && err.response?.data?.name?.code === 'validation_not_unique') {
        console.log('ℹ️ Collection sw_video_projects already exists');
      } else {
        throw err;
      }
    }

    // 2. Create sw_video_scenes
    try {
      // Need to find sw_video_projects ID to link relation
      const projectsCollection = await pb.collections.getOne('sw_video_projects');
      
      const schema = [...swVideoScenesCollection.schema];
      const relationField = schema.find(f => f.name === 'project_id');
      if (relationField && relationField.options) {
        relationField.options.collectionId = projectsCollection.id;
      }

      await pb.collections.create({
        ...swVideoScenesCollection,
        schema
      } as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log('✅ Created collection: sw_video_scenes');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.status === 400 && err.response?.data?.name?.code === 'validation_not_unique') {
        console.log('ℹ️ Collection sw_video_scenes already exists');
      } else {
        throw err;
      }
    }

    // 3. Migrate Data (if old collections exist)
    try {
      const oldProjects = await pb.collection('video_projects').getFullList();
      console.log(`Found ${oldProjects.length} old projects to migrate`);
      
      for (const record of oldProjects) {
        // Check if already migrated (by ID)
        try {
          await pb.collection('sw_video_projects').getOne(record.id);
          console.log(`Skipping project ${record.id} (already migrated)`);
          continue;
        } catch {
          // Not found, proceed to migrate
        }

        await pb.collection('sw_video_projects').create({
            id: record.id, // Keep same ID
            name: record.name,
            description: record.description,
            status: record.status,
            settings: record.settings,
            user_id: record.user_id,
            isActive: record.isActive,
            isDeleted: record.isDeleted,
            created: record.created,
            updated: record.updated,
        });
        console.log(`Migrated project: ${record.id}`);
      }
    } catch {
      console.log('ℹ️ Old collection video_projects not found or empty. Skipping data migration.');
    }

    // Migrate Scenes
    try {
      const oldScenes = await pb.collection('video_scenes').getFullList();
      console.log(`Found ${oldScenes.length} old scenes to migrate`);

      for (const record of oldScenes) {
         try {
          await pb.collection('sw_video_scenes').getOne(record.id);
          continue;
        } catch {
          // Proceed
        }

        await pb.collection('sw_video_scenes').create({
            id: record.id,
            project_id: record.project_id,
            order: record.order,
            script_text: record.script_text,
            visual_prompt: record.visual_prompt,
            image_url: record.image_url,
            audio_url: record.audio_url,
            video_url: record.video_url,
            duration: record.duration,
            metadata: record.metadata,
            isDeleted: record.isDeleted,
            created: record.created,
            updated: record.updated,
        });
        console.log(`Migrated scene: ${record.id}`);
      }
    } catch {
      console.log('ℹ️ Old collection video_scenes not found or empty.');
    }

    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
if (import.meta.url === `file://${process.argv[1]}`) {
  import('dotenv').then(({ default: dotenv }) => {
    dotenv.config();
    migrateVideoProjects()
      .then(() => process.exit(0))
      .catch(() => process.exit(1));
  });
}
