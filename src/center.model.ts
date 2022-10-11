import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { TranslatedModel } from "translation.mapper";

@Entity({ tableName: "center" })
export class Center implements TranslatedModel {
  @PrimaryKey()
  id!: string;

  @Property({ nullable: true })
  name?: string;

  @Property({ nullable: true })
  description?: string;
  /*
  @Property()
  author!: string;
*/
  @Property({ fieldName: "created_at" })
  createdAt!: Date;

  @Property({ fieldName: "updated_at" })
  updatedAt!: Date;

  @Property({ type: "json", nullable: true })
  translations?: TranslatedModel["translations"];
}
